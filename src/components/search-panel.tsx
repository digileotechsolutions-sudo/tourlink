"use client";

import { CalendarDays, Search, UsersRound } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchPanel({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [place, setPlace] = useState("");
  const [type, setType] = useState("trips");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState("2");

  function search(event: React.FormEvent) {
    event.preventDefault();
    const path = type === "vehicles" ? "/vehicles" : "/trips";
    const query = place ? `?search=${encodeURIComponent(place)}` : "";
    router.push(`${path}${query}`);
  }

  const tabBase =
    "grid h-14 flex-1 place-items-center rounded-lg text-xs font-extrabold transition sm:h-full sm:px-4";

  return (
    <form
      onSubmit={search}
      className={`rounded-2xl bg-white p-2 shadow-card ring-1 ring-slate-200/80 ${
        compact ? "border border-slate-100" : ""
      }`}
    >
      <div className="grid items-stretch gap-1 md:grid-cols-[auto_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="flex items-center gap-1 rounded-xl bg-sand p-1.5 md:flex-col">
          <button type="button" onClick={() => setType("trips")} className={`${tabBase} ${type === "trips" ? "bg-ink text-white shadow-sm" : "bg-transparent text-slate-500 hover:text-ink"}`}>Trips</button>
          <button type="button" onClick={() => setType("vehicles")} className={`${tabBase} ${type === "vehicles" ? "bg-ink text-white shadow-sm" : "bg-transparent text-slate-500 hover:text-ink"}`}>Vehicles</button>
        </div>

        <label className="flex items-center gap-2.5 rounded-xl px-3 transition hover:bg-sand focus-within:ring-2 focus-within:ring-lagoon/20">
          <Search className="shrink-0 text-sun" size={20} />
          <span className="min-w-0 flex-1 py-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Where to?</span>
            <input value={place} onChange={event => setPlace(event.target.value)} placeholder="Destination or experience" className="w-full bg-transparent text-sm font-bold text-ink outline-none placeholder:font-normal placeholder:text-slate-400" />
          </span>
        </label>

        <label className="flex items-center gap-2.5 rounded-xl px-3 transition hover:bg-sand focus-within:ring-2 focus-within:ring-lagoon/20">
          <CalendarDays className="shrink-0 text-sun" size={20} />
          <span className="min-w-0 flex-1 py-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">When</span>
            <input type="date" value={date} onChange={event => setDate(event.target.value)} aria-label="When" className="w-full bg-transparent text-sm font-bold text-ink outline-none" />
          </span>
        </label>

        <label className="flex items-center gap-2.5 rounded-xl px-3 transition hover:bg-sand focus-within:ring-2 focus-within:ring-lagoon/20">
          <UsersRound className="shrink-0 text-sun" size={20} />
          <span className="min-w-0 flex-1 py-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Travelers</span>
            <select value={travelers} onChange={event => setTravelers(event.target.value)} className="w-full bg-transparent text-sm font-bold text-ink outline-none">
              <option value="1">1 traveler</option>
              <option value="2">2 travelers</option>
              <option value="3">3 travelers</option>
              <option value="4">4 travelers</option>
              <option value="5">5+ travelers</option>
            </select>
          </span>
        </label>

        <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-ink px-5 text-xs font-extrabold text-white transition hover:bg-lagoon sm:text-sm">
          <Search size={16} />Search
        </button>
      </div>
    </form>
  );
}
