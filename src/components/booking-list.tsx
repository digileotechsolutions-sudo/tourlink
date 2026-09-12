"use client";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, Download, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { MpesaPayForm } from "@/components/mpesa-pay-form";

type Booking = { id: string; reference: string; status: string; type: string; startDate: string; endDate: string; travelers: number; amount: number; currency: string; item: string; destination: string; image: string | null; hasReview: boolean; paymentStatus: string };
const money = (amount: number, currency: string) => `${currency} ${amount.toLocaleString("en-KE")}`;

export function BookingList({ bookings }: { bookings: Booking[] }) {
  const [items, setItems] = useState(bookings);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  async function cancel(id: string) {
    if (!window.confirm("Cancel this booking?")) return;
    setBusy(id);
    const response = await fetch(`/api/bookings/${id}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: "Cancelled by traveler" }) });
    const data = await response.json();
    setBusy("");
    if (!response.ok) { setNotice(data.error); return; }
    setItems(current => current.map(item => item.id === id ? { ...item, status: "CANCELLED" } : item));
    setNotice("Booking cancelled successfully.");
  }
  return <div className="rounded-2xl bg-white p-5 shadow-soft sm:p-7"><div className="flex items-center justify-between"><div><p className="eyebrow">Your travel ledger</p><h2 className="mt-1 text-2xl font-black">Bookings</h2></div><Link href="/trips" className="rounded-full bg-sun px-4 py-2.5 text-xs font-extrabold">Find a trip</Link></div>{notice && <p className="mt-5 rounded-xl bg-sand p-3 text-xs font-bold text-ink">{notice}</p>}<div className="mt-7 grid gap-4">{items.length ? items.map(booking => <article key={booking.id} className="overflow-hidden rounded-2xl border border-slate-100"><div className="flex gap-4 p-4"><div className="h-24 w-24 shrink-0 rounded-xl bg-sand bg-cover bg-center" style={booking.image ? { backgroundImage: `url(${booking.image})` } : undefined}><span className="m-2 inline-flex rounded-full bg-white/90 px-2 py-1 text-[9px] font-black text-ink">{booking.type}</span></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="truncate text-sm font-extrabold">{booking.item}</h3><p className="mt-1 text-xs text-slate-500">{booking.destination}</p></div><Status status={booking.status} /></div><p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500"><span><CalendarDays size={13} className="mr-1 inline text-sun" />{new Date(booking.startDate).toLocaleDateString("en-KE", { day: "numeric", month: "short" })} - {new Date(booking.endDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</span><span>{booking.travelers} traveler{booking.travelers === 1 ? "" : "s"}</span></p><p className="mt-2 text-[11px] font-bold text-slate-400">{booking.reference}</p></div></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-mist px-4 py-3"><span className="text-sm font-black">{money(booking.amount, booking.currency)} <span className="text-[10px] font-normal text-slate-400">· payment {booking.paymentStatus.toLowerCase()}</span></span><div className="flex flex-wrap justify-end gap-2">{["PENDING", "FAILED"].includes(booking.paymentStatus) && booking.status !== "CANCELLED" && <MpesaPayForm bookingId={booking.id} />}{booking.status === "COMPLETED" && !booking.hasReview && <Link href={`/dashboard/reviews?booking=${booking.id}`} className="rounded-full bg-lagoon px-3 py-2 text-[10px] font-extrabold text-white">Leave review</Link>}{booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && <button onClick={() => cancel(booking.id)} disabled={busy === booking.id} className="rounded-full border border-red-200 px-3 py-2 text-[10px] font-extrabold text-red-600">{busy === booking.id ? <Loader2 size={13} className="animate-spin" /> : "Cancel"}</button>}{booking.paymentStatus === "SUCCESSFUL" && <Link href={`/dashboard/receipts/${booking.id}`} className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500" title="View receipt"><Download size={14} /></Link>}</div></div></article>) : <div className="grid place-items-center py-16 text-center"><Clock3 className="text-sun" /><h3 className="mt-4 font-extrabold">No bookings yet</h3><p className="mt-2 text-sm text-slate-500">Your next story is waiting to be booked.</p></div>}</div></div>;
}

function Status({ status }: { status: string }) { const active = ["PAID", "CONFIRMED", "IN_PROGRESS"].includes(status); return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${active ? "bg-leaf/10 text-leaf" : status === "CANCELLED" ? "bg-red-50 text-red-600" : status === "COMPLETED" ? "bg-lagoon/10 text-lagoon" : "bg-sand text-[#a45913]"}`}>{active ? <CheckCircle2 size={12} /> : status === "CANCELLED" ? <XCircle size={12} /> : <Clock3 size={12} />}{status}</span>; }
