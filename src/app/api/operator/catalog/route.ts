import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET() { const user = await getCurrentUser(); if (!user || user.role !== "OPERATOR") return NextResponse.json({ error: "Operator access required" }, { status: 403 }); const [destinations, categories, vehicles] = await Promise.all([prisma.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }), prisma.tripCategory.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }), prisma.vehicle.findMany({ where: { status: "PUBLISHED" }, select: { id: true, name: true, seatingCapacity: true, location: true }, orderBy: { name: "asc" } })]); return NextResponse.json({ destinations, categories, vehicles }); }
