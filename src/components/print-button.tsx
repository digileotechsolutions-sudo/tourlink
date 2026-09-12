"use client";
import { Download } from "lucide-react";
export function PrintButton() { return <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-extrabold text-white"><Download size={14} /> Print / save receipt</button>; }
