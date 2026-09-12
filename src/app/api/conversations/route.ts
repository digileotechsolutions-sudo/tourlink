import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() { const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 }); const conversations = await prisma.conversation.findMany({ where: { participants: { some: { userId: user.id } } }, include: { participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } }); return NextResponse.json({ conversations }); }

export async function POST(request: Request) { const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 }); try { const input = z.object({ participantId: z.string(), bookingId: z.string().optional(), body: z.string().min(1).max(4000) }).parse(await request.json()); if (input.participantId === user.id) return NextResponse.json({ error: "A conversation needs another participant." }, { status: 400 }); const conversation = await prisma.conversation.create({ data: { bookingId: input.bookingId, participants: { create: [{ userId: user.id }, { userId: input.participantId }] }, messages: { create: { senderId: user.id, body: input.body } } }, include: { messages: true } }); return NextResponse.json({ conversation }, { status: 201 }); } catch { return NextResponse.json({ error: "Could not start conversation." }, { status: 400 }); } }
