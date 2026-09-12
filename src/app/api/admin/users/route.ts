import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { hashPassword } from "@/lib/auth";
import { normalizePhone, sendAccountApprovalMessage } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

const roleSchema = z.enum(["TRAVELER", "OPERATOR", "VEHICLE_OWNER"]);

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({ where: { email: { not: { startsWith: "deleted-" } } }, select: { id: true, name: true, email: true, role: true, verificationLevel: true, approvalStatus: true, accountStatus: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 200 });
    const bookings = await prisma.booking.findMany({ where: { status: { notIn: ["CANCELLED", "REFUNDED"] } }, select: { totalAmount: true, startDate: true, trip: { select: { operatorId: true } }, vehicle: { select: { ownerId: true } } } });
    const now = new Date();
    const revenue = new Map<string, { realized: number; projected: number }>();
    for (const booking of bookings) {
      const ownerId = booking.trip?.operatorId || booking.vehicle?.ownerId;
      if (!ownerId) continue;
      const current = revenue.get(ownerId) || { realized: 0, projected: 0 };
      if (booking.startDate >= now) current.projected += booking.totalAmount;
      else current.realized += booking.totalAmount;
      revenue.set(ownerId, current);
    }
    return NextResponse.json({ users: users.map(user => ({ ...user, realizedRevenue: revenue.get(user.id)?.realized || 0, projectedRevenue: revenue.get(user.id)?.projected || 0 })) });
  } catch { return NextResponse.json({ error: "Admin access required" }, { status: 403 }); }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const input = z.object({ name: z.string().min(2).max(80), email: z.string().email(), phone: z.string().min(8), password: z.string().min(8), role: roleSchema }).parse(await request.json());
    const email = input.email.toLowerCase();
    const phone = normalizePhone(input.phone);
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] }, select: { email: true, phone: true } });
    if (existing?.email === email) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    if (existing?.phone === phone) return NextResponse.json({ error: "An account with that phone number already exists." }, { status: 409 });
    const slug = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
    const user = await prisma.user.create({ data: { name: input.name, email, phone, passwordHash: await hashPassword(input.password), emailVerifiedAt: new Date(), phoneVerifiedAt: new Date(), approvalStatus: "APPROVED", accountStatus: "ACTIVE", role: input.role, travelerProfile: input.role === "TRAVELER" ? { create: {} } : undefined, operatorProfile: input.role === "OPERATOR" ? { create: { companyName: input.name, slug } } : undefined, vehicleOwnerProfile: input.role === "VEHICLE_OWNER" ? { create: {} } : undefined } });
    await prisma.adminLog.create({ data: { adminId: admin.id, action: "CREATE_USER", entity: "User", entityId: user.id, metadata: { role: input.role } } });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, approvalStatus: user.approvalStatus, accountStatus: user.accountStatus, realizedRevenue: 0, projectedRevenue: 0 } }, { status: 201 });
  } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the user details." }, { status: 400 }); return NextResponse.json({ error: error instanceof Error && error.message.startsWith("Use a valid") ? error.message : "User could not be created." }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    const input = z.object({ id: z.string(), verificationLevel: z.enum(["BASIC", "VERIFIED", "TRUSTED"]).optional(), role: z.enum(["TRAVELER", "OPERATOR", "VEHICLE_OWNER", "ADMIN"]).optional(), approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(), approvalNote: z.string().max(1000).nullable().optional(), accountStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional() }).parse(await request.json());
    if (input.id === admin.id && input.accountStatus && input.accountStatus !== "ACTIVE") return NextResponse.json({ error: "You cannot deactivate or suspend your own admin account." }, { status: 400 });
    const user = await prisma.user.update({ where: { id: input.id }, data: { verificationLevel: input.verificationLevel, role: input.role, approvalStatus: input.approvalStatus, approvalReviewedAt: input.approvalStatus ? new Date() : undefined, approvalNote: input.approvalNote, accountStatus: input.accountStatus } });
    if (input.approvalStatus === "APPROVED" || input.approvalStatus === "REJECTED") {
      try {
        await sendAccountApprovalMessage({ email: user.email, phone: user.phone, name: user.name, approved: input.approvalStatus === "APPROVED", note: input.approvalNote });
      } catch (error) {
        console.error("Account approval notification failed", error);
      }
    }
    await prisma.adminLog.create({ data: { adminId: admin.id, action: input.approvalStatus ? "REVIEW_ACCOUNT" : "UPDATE_USER", entity: "User", entityId: user.id, metadata: input } });
    return NextResponse.json({ user: { id: user.id, role: user.role, verificationLevel: user.verificationLevel, approvalStatus: user.approvalStatus, accountStatus: user.accountStatus } });
  } catch { return NextResponse.json({ error: "User could not be updated." }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    const input = z.object({ id: z.string() }).parse(await request.json());
    if (input.id === admin.id) return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });
    const target = await prisma.user.findUnique({ where: { id: input.id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (target.role === "ADMIN") return NextResponse.json({ error: "Admin accounts cannot be deleted." }, { status: 400 });
    const anonymizedEmail = `deleted-${input.id}@tourlink.invalid`;
    const user = await prisma.user.update({ where: { id: input.id }, data: { name: "Deleted user", email: anonymizedEmail, phone: null, avatarUrl: null, accountStatus: "INACTIVE", approvalStatus: "REJECTED", approvalNote: "Account removed by an administrator." } });
    await prisma.adminLog.create({ data: { adminId: admin.id, action: "DELETE_USER", entity: "User", entityId: user.id, metadata: { mode: "anonymized" } } });
    return NextResponse.json({ deleted: true, id: user.id, mode: "anonymized" });
  } catch (error) {
    if (error instanceof Error && error.message === "ADMIN_REQUIRED") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    console.error("User deletion failed", error);
    return NextResponse.json({ error: "User could not be deleted." }, { status: 400 });
  }
}
