import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
export async function GET() { try { await requireAdmin(); return NextResponse.json({ settings: await prisma.setting.findMany({ orderBy: { key: "asc" } }) }); } catch { return NextResponse.json({ error: "Admin access required" }, { status: 403 }); } }
export async function PATCH(request: Request) { try { const admin = await requireAdmin(); const input = z.object({ key: z.string().min(2).max(100), value: z.string().max(500) }).parse(await request.json()); const setting = await prisma.setting.upsert({ where: { key: input.key }, create: input, update: { value: input.value } }); await prisma.adminLog.create({ data: { adminId: admin.id, action: "UPDATE_SETTING", entity: "Setting", entityId: setting.id, metadata: input } }); return NextResponse.json({ setting }); } catch { return NextResponse.json({ error: "Setting could not be saved." }, { status: 400 }); } }
