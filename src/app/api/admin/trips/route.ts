import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() { try { await requireAdmin(); const trips = await prisma.trip.findMany({ where: { status: { not: "ARCHIVED" } }, select: { id: true, name: true, slug: true, status: true, featured: true, verificationStatus: true, operator: { select: { name: true, operatorProfile: { select: { companyName: true } } } } }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 50 }); return NextResponse.json({ trips }); } catch { return NextResponse.json({ error: "Unable to load trips." }, { status: 400 }); } }
