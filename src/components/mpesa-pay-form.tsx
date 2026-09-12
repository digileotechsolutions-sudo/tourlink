"use client";
import { Loader2, Smartphone } from "lucide-react";
import { useState } from "react";

export function MpesaPayForm({ bookingId }: { bookingId: string }) {
  const [phone, setPhone] = useState("254");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function pay() {
    setBusy(true);
    setNotice("");
    const response = await fetch("/api/payments/mpesa/stk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, phoneNumber: phone }) });
    const data = await response.json();
    setBusy(false);
    setNotice(response.ok ? "STK push sent. Enter your M-Pesa PIN on your phone." : data.error);
  }
  return <div className="flex flex-wrap items-center gap-2"><div className="flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5"><Smartphone size={13} className="mr-1 text-leaf" /><input value={phone} onChange={event => setPhone(event.target.value.replace(/\D/g, "").slice(0, 12))} className="w-28 bg-transparent text-[11px] font-bold outline-none" aria-label="M-Pesa phone number" /></div><button onClick={pay} disabled={busy || phone.length !== 12} className="flex items-center gap-1 rounded-full bg-sun px-3 py-2 text-[10px] font-extrabold text-ink disabled:opacity-50">{busy && <Loader2 size={12} className="animate-spin" />} Pay M-Pesa</button>{notice && <span className="w-full text-[10px] font-bold text-lagoon">{notice}</span>}</div>;
}
