import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const admin = await requireAdmin(); const { id } = await params; const input = z.object({ featured: z.boolean().optional(), verificationStatus: z.enum(["PENDING", "APPROVED", "REJECTED", "MORE_INFO"]).optional(), status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional() }).parse(await request.json()); const trip = await prisma.trip.update({ where: { id }, data: input }); await prisma.adminLog.create({ data: { adminId: admin.id, action: "UPDATE_TRIP", entity: "Trip", entityId: id, metadata: input } }); return NextResponse.json({ trip }); } catch { return NextResponse.json({ error: "Trip could not be updated." }, { status: 400 }); } }
