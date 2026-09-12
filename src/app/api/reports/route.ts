import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csv(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "OPERATOR", "VEHICLE_OWNER"].includes(user.role)) return NextResponse.json({ error: "Report access required" }, { status: 403 });

  const where = user.role === "ADMIN" ? {} : user.role === "OPERATOR" ? { trip: { operatorId: user.id } } : { vehicle: { ownerId: user.id } };
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      traveler: { select: { name: true, email: true, phone: true } },
      trip: { select: { name: true } },
      vehicle: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const rows = [
    ["Reference", "Type", "Status", "Traveler", "Email", "Phone", "Trip", "Vehicle", "Start date", "End date", "Travelers", "Amount", "Currency", "Created"],
    ...bookings.map(booking => [
      booking.reference,
      booking.type,
      booking.status,
      booking.traveler.name,
      booking.traveler.email,
      booking.traveler.phone,
      booking.trip?.name,
      booking.vehicle?.name,
      booking.startDate.toISOString(),
      booking.endDate.toISOString(),
      booking.travelers,
      booking.totalAmount,
      booking.currency,
      booking.createdAt.toISOString()
    ])
  ];
  const body = rows.map(row => row.map(csv).join(",")).join("\r\n");
  return new NextResponse(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="tourlink-${user.role.toLowerCase()}-bookings.csv"`, "Cache-Control": "no-store" } });
}
