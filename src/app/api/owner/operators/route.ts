import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET() { const user = await getCurrentUser(); if (!user || user.role !== "VEHICLE_OWNER") return NextResponse.json({ error: "Vehicle owner access required" }, { status: 403 }); const operators = await prisma.user.findMany({ where: { role: "OPERATOR", accountStatus: "ACTIVE", approvalStatus: "APPROVED" }, select: { id: true, name: true, operatorProfile: { select: { companyName: true } } }, orderBy: { name: "asc" } }); return NextResponse.json({ operators }); }
