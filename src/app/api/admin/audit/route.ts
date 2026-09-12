import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
export async function GET() { try { await requireAdmin(); const logs = await prisma.adminLog.findMany({ include: { admin: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 100 }); return NextResponse.json({ logs }); } catch { return NextResponse.json({ error: "Admin access required" }, { status: 403 }); } }
