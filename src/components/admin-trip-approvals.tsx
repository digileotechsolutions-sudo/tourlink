"use client";

import { CheckCircle2, Map, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type Trip = { id: string; name: string; slug: string; status: string; featured: boolean; verificationStatus: string; operator: { name: string; operatorProfile: { companyName: string } | null } };

export function AdminTripApprovals() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/admin/trips").then(response => response.json()).then(data => { setTrips(data.trips || []); setLoading(false); });
  }, []);

  async function review(id: string, verificationStatus: "APPROVED" | "REJECTED" | "MORE_INFO") {
    setBusy(id);
    setNotice("");
    const response = await fetch(`/api/admin/trips/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ verificationStatus, status: verificationStatus === "APPROVED" ? "PUBLISHED" : "DRAFT" }) });
    const data = await response.json();
    setBusy("");
    if (!response.ok) { setNotice(data.error || "Trip could not be reviewed."); return; }
    setTrips(current => current.map(trip => trip.id === id ? { ...trip, ...data.trip } : trip));
    setNotice(`Trip ${verificationStatus.toLowerCase().replace("_", " ")}.`);
  }

  if (loading) return <section className="rounded-2xl bg-white p-6 shadow-soft"><p className="text-sm font-bold text-slate-500">Loading trip submissions...</p></section>;
  const pending = trips.filter(trip => trip.verificationStatus === "PENDING" || trip.verificationStatus === "MORE_INFO");
  return <section className="rounded-2xl bg-white p-6 shadow-soft">
    <p className="eyebrow">Trip marketplace</p>
    <div className="mt-1 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Trip approvals</h2><span className="text-xs font-bold text-slate-400">{pending.length} awaiting review</span></div>
    {notice && <p className="mt-4 rounded-xl bg-sand p-3 text-xs font-bold text-ink">{notice}</p>}
    {!pending.length && <p className="mt-6 rounded-xl bg-mist p-8 text-center text-sm text-slate-500">No trip submissions are waiting for approval.</p>}
    <div className="mt-6 grid gap-3">{pending.map(trip => <article key={trip.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-100 p-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-sand text-lagoon"><Map size={19} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-black">{trip.name}</h3><span className="rounded-full bg-sand px-2.5 py-1 text-[10px] font-black">{trip.verificationStatus}</span></div><p className="mt-1 text-xs text-slate-500">{trip.operator.operatorProfile?.companyName || trip.operator.name} · {trip.slug} · {trip.status}</p></div><div className="flex flex-wrap gap-2"><button disabled={busy === trip.id} onClick={() => review(trip.id, "APPROVED")} className="inline-flex items-center gap-1.5 rounded-full bg-leaf px-3 py-2 text-[10px] font-black text-white"><CheckCircle2 size={13} />Approve</button><button disabled={busy === trip.id} onClick={() => review(trip.id, "MORE_INFO")} className="rounded-full border border-slate-200 px-3 py-2 text-[10px] font-black">Request info</button><button disabled={busy === trip.id} onClick={() => review(trip.id, "REJECTED")} className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-[10px] font-black text-red-600"><XCircle size={13} />Reject</button></div></article>)}</div>
  </section>;
}
