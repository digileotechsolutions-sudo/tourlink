import { NextResponse } from "next/server";
import { z } from "zod";
import { getOperator, getOperatorProfile } from "@/lib/operator";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({ companyName: z.string().min(2).max(100), description: z.string().max(1000).optional(), logoUrl: z.string().max(2_000_000).nullable().optional(), website: z.string().url().optional().or(z.literal("")), yearsActive: z.number().int().min(0).max(100) });
export async function GET() { try { const user = await getOperator(); return NextResponse.json({ profile: await getOperatorProfile(user.id) }); } catch { return NextResponse.json({ error: "Operator access required" }, { status: 403 }); } }
export async function PATCH(request: Request) { try { const user = await getOperator(); const input = profileSchema.parse(await request.json()); const current = await getOperatorProfile(user.id); if (!current) return NextResponse.json({ error: "Operator profile not found" }, { status: 404 }); const profile = await prisma.operatorProfile.update({ where: { userId: user.id }, data: input }); return NextResponse.json({ profile }); } catch { return NextResponse.json({ error: "Company profile could not be saved." }, { status: 400 }); } }
