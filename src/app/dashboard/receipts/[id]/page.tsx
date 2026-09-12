import Link from "next/link";
import { ArrowLeft, CheckCircle2, MapPin } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/print-button";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { id } = await params;
  const booking = await prisma.booking.findFirst({ where: { id, travelerId: user.id }, include: { trip: { include: { destination: true } }, vehicle: true, payments: { where: { status: "SUCCESSFUL" }, orderBy: { paidAt: "desc" }, take: 1 } } });
  if (!booking) return <div className="rounded-2xl bg-white p-10 text-center shadow-soft">Receipt not found.</div>;
  const item = booking.trip?.name || booking.vehicle?.name || "TourLink booking";
  return <div><Link href="/dashboard/bookings" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={16} /> Back to bookings</Link><div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-soft sm:p-10"><div className="flex items-start justify-between border-b border-dashed border-slate-200 pb-7"><div><p className="text-xl font-black tracking-[-.06em]">TOUR<span className="text-sun">link</span></p><p className="mt-4 eyebrow">Digital receipt</p><h1 className="mt-1 text-2xl font-black">Payment confirmed</h1></div><CheckCircle2 size={34} className="text-leaf" /></div><div className="mt-7 grid gap-5 text-sm"><div className="flex justify-between gap-4"><span className="text-slate-400">Booking reference</span><strong>{booking.reference}</strong></div><div className="flex justify-between gap-4"><span className="text-slate-400">Traveler</span><strong>{user.name}</strong></div><div className="flex justify-between gap-4"><span className="text-slate-400">Journey</span><strong className="text-right">{item}</strong></div><div className="flex justify-between gap-4"><span className="text-slate-400">Destination</span><strong className="flex items-center gap-1 text-right"><MapPin size={14} className="text-sun" />{booking.trip?.destination.name || booking.vehicle?.location}</strong></div></div><div className="my-7 border-y border-slate-100 py-6"><div className="flex justify-between text-lg"><span className="font-bold">Total paid</span><strong>{booking.currency} {booking.totalAmount.toLocaleString("en-KE")}</strong></div><p className="mt-3 text-xs text-slate-400">M-Pesa reference: {booking.payments[0]?.transactionReference || "Pending provider reference"}</p></div><PrintButton /></div></div>;
}
