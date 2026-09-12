import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const vehicles = await prisma.vehicle.findMany({
      where: { status: { not: "ARCHIVED" } },
      include: { owner: { select: { name: true, email: true, phone: true } }, images: { take: 1 } },
      orderBy: [{ verificationStatus: "asc" }, { createdAt: "desc" }]
    });
    return NextResponse.json({ vehicles });
  } catch {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    const input = z.object({ id: z.string(), verificationStatus: z.enum(["APPROVED", "REJECTED", "MORE_INFO"]), note: z.string().max(1000).optional() }).parse(await request.json());
    const vehicle = await prisma.vehicle.update({ where: { id: input.id }, data: { verificationStatus: input.verificationStatus, status: input.verificationStatus === "APPROVED" ? "PUBLISHED" : "DRAFT" }, include: { owner: { select: { name: true, email: true } } } });
    await prisma.adminLog.create({ data: { adminId: admin.id, action: "REVIEW_VEHICLE", entity: "Vehicle", entityId: vehicle.id, metadata: { verificationStatus: input.verificationStatus, note: input.note || null } } });
    return NextResponse.json({ vehicle: { id: vehicle.id, verificationStatus: vehicle.verificationStatus, status: vehicle.status } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? "Invalid vehicle review." : "Vehicle could not be reviewed." }, { status: 400 });
  }
}
