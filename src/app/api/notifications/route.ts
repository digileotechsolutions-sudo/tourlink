import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET() { const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 }); return NextResponse.json({ notifications: await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }) }); }
export async function PATCH() { const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 }); await prisma.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } }); return NextResponse.json({ ok: true }); }
