import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await params;
  const booking = await prisma.booking.findFirst({
    where: { id, travelerId: user.id },
    include: {
      trip: { select: { name: true, destination: true } },
      vehicle: { select: { name: true, location: true } },
      payments: { where: { status: "SUCCESSFUL" }, orderBy: { paidAt: "desc" }, take: 1 }
    }
  });
  if (!booking) return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  return NextResponse.json({ receipt: { reference: booking.reference, issuedAt: booking.updatedAt, traveler: user.name, item: booking.trip?.name || booking.vehicle?.name, destination: booking.trip?.destination.name || booking.vehicle?.location, dates: { from: booking.startDate, to: booking.endDate }, amount: booking.totalAmount, currency: booking.currency, transactionReference: booking.payments[0]?.transactionReference || null } });
}
