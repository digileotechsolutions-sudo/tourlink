"use client";

import { CheckCircle2, Image as ImageIcon, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type Vehicle = { id: string; name: string; registrationNumber: string; make: string; model: string; year: number; bodyType: string; seatingCapacity: number; transmission: string; fuelType: string; pricePerDay: number; location: string; verificationStatus: string; status: string; owner: { name: string; email: string; phone: string | null }; images: { url: string }[] };

export function AdminVehicleApprovals() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/vehicles");
    const data = await response.json();
    setVehicles(data.vehicles || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function review(id: string, verificationStatus: "APPROVED" | "REJECTED" | "MORE_INFO") {
    setBusy(id);
    setNotice("");
    const response = await fetch("/api/admin/vehicles", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, verificationStatus }) });
    const data = await response.json();
    setBusy("");
    if (!response.ok) { setNotice(data.error || "Vehicle could not be reviewed."); return; }
    setVehicles(current => current.map(vehicle => vehicle.id === id ? { ...vehicle, ...data.vehicle } : vehicle));
    setNotice(`Vehicle ${verificationStatus.toLowerCase().replace("_", " ")}.`);
  }

  if (loading) return <section className="rounded-2xl bg-white p-6 shadow-soft"><p className="text-sm font-bold text-slate-500">Loading vehicle submissions...</p></section>;
  const pending = vehicles.filter(vehicle => vehicle.verificationStatus === "PENDING" || vehicle.verificationStatus === "MORE_INFO");
  return <section className="rounded-2xl bg-white p-6 shadow-soft">
    <p className="eyebrow">Vehicle marketplace</p>
    <div className="mt-1 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Vehicle approvals</h2><span className="text-xs font-bold text-slate-400">{pending.length} awaiting review</span></div>
    {notice && <p className="mt-4 rounded-xl bg-sand p-3 text-xs font-bold text-ink">{notice}</p>}
    {!pending.length && <p className="mt-6 rounded-xl bg-mist p-8 text-center text-sm text-slate-500">No vehicle submissions are waiting for approval.</p>}
    <div className="mt-6 grid gap-4">{pending.map(vehicle => <article key={vehicle.id} className="grid gap-4 rounded-2xl border border-slate-100 p-4 lg:grid-cols-[120px_1fr_auto]">
      <div className="grid h-28 w-full place-items-center overflow-hidden rounded-xl bg-sand text-lagoon">{vehicle.images[0]?.url ? <img src={vehicle.images[0].url} alt={vehicle.name} className="h-full w-full object-cover" /> : <ImageIcon size={24} />}</div>
      <div><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-black">{vehicle.name}</h3><p className="mt-1 text-xs text-slate-500">{vehicle.make} {vehicle.model} · {vehicle.year} · {vehicle.registrationNumber}</p></div><span className="rounded-full bg-sand px-2.5 py-1 text-[10px] font-black">{vehicle.verificationStatus}</span></div><p className="mt-3 text-xs text-slate-500">Owner: <strong>{vehicle.owner.name}</strong> · {vehicle.owner.email} · {vehicle.owner.phone || "No phone"}</p><p className="mt-2 text-xs text-slate-500">{vehicle.bodyType} · {vehicle.seatingCapacity} seats · {vehicle.transmission} · {vehicle.fuelType} · KES {vehicle.pricePerDay.toLocaleString()}/day · {vehicle.location}</p></div>
      <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch"><button disabled={busy === vehicle.id} onClick={() => review(vehicle.id, "APPROVED")} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-leaf px-3 py-2 text-[10px] font-black text-white"><CheckCircle2 size={13} />Approve</button><button disabled={busy === vehicle.id} onClick={() => review(vehicle.id, "MORE_INFO")} className="rounded-full border border-slate-200 px-3 py-2 text-[10px] font-black">Request info</button><button disabled={busy === vehicle.id} onClick={() => review(vehicle.id, "REJECTED")} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-[10px] font-black text-red-600"><XCircle size={13} />Reject</button></div>
    </article>)}</div>
  </section>;
}
