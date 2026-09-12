import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestMpesaStkPush } from "@/lib/payments/mpesa";

export async function POST(request: Request) { const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 }); try { const input = z.object({ bookingId: z.string(), phoneNumber: z.string().regex(/^254\d{9}$/) }).parse(await request.json()); const payment = await prisma.payment.findFirst({ where: { bookingId: input.bookingId, booking: { travelerId: user.id }, status: { in: ["PENDING", "FAILED"] } } }); if (!payment) return NextResponse.json({ error: "Payment request is no longer available." }, { status: 404 }); const result = await requestMpesaStkPush({ phoneNumber: input.phoneNumber, amount: payment.amount, accountReference: payment.merchantReference, description: `TourLink booking ${payment.merchantReference}` }); await prisma.payment.update({ where: { id: payment.id }, data: { status: "PROCESSING", phoneNumber: input.phoneNumber, providerResponse: result } }); return NextResponse.json({ ok: true, checkoutRequestId: result.checkoutRequestId }); } catch { return NextResponse.json({ error: "We could not start the M-Pesa request." }, { status: 400 }); } }
