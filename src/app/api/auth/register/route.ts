import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { isOtpDeliveryConfigured, isOtpDevelopmentMode, issueOtp, normalizePhone, sendAccountCreatedMessage } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(8),
  role: z.enum(["TRAVELER", "OPERATOR", "VEHICLE_OWNER"]).default("TRAVELER")
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    if (!isOtpDeliveryConfigured() && !isOtpDevelopmentMode()) {
      return NextResponse.json({ error: "Account verification delivery is not configured." }, { status: 503 });
    }

    const email = input.email.toLowerCase();
    const phone = normalizePhone(input.phone);
    const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] }, select: { email: true, phone: true } });
    if (exists?.email === email) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    if (exists?.phone === phone) return NextResponse.json({ error: "An account with that phone number already exists." }, { status: 409 });

    const profileSlug = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        phone,
        role: input.role,
        passwordHash: await hashPassword(input.password),
        travelerProfile: input.role === "TRAVELER" ? { create: {} } : undefined,
        operatorProfile: input.role === "OPERATOR" ? { create: { companyName: input.name, slug: profileSlug } } : undefined,
        vehicleOwnerProfile: input.role === "VEHICLE_OWNER" ? { create: {} } : undefined
      }
    });

    const [emailCode, phoneCode] = await Promise.all([
      issueOtp(user.id, "EMAIL", email),
      issueOtp(user.id, "PHONE", phone)
    ]);
    await sendAccountCreatedMessage({ name: user.name, email: user.email, phone });

    return NextResponse.json({
      verificationRequired: true,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
      devOtps: emailCode && phoneCode ? { email: emailCode, phone: phoneCode } : undefined
    }, { status: 201 });
  } catch (error) {
    console.error("Registration failed", error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check your details." }, { status: 400 });
    if (error instanceof Error && error.message.startsWith("Use a valid Kenyan phone number")) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof Error && (error.message.includes("delivery") || error.message.includes("SMS"))) return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json({ error: "Unable to create your account right now." }, { status: 500 });
  }
}
