import { NextResponse } from "next/server";
import { getOperator } from "@/lib/operator";
import { prisma } from "@/lib/prisma";
export async function GET() { try { const user = await getOperator(); const bookings = await prisma.booking.findMany({ where: { trip: { operatorId: user.id } }, include: { traveler: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }, trip: { select: { id: true, name: true, destination: { select: { name: true } } } }, vehicle: { select: { name: true } }, payments: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { createdAt: "desc" } }); return NextResponse.json({ bookings }); } catch { return NextResponse.json({ error: "Operator access required" }, { status: 403 }); } }
