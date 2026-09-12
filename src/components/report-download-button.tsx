"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export function ReportDownloadButton({ label = "Download report" }: { label?: string }) {
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const response = await fetch("/api/reports");
      if (!response.ok) throw new Error("Report unavailable");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = response.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] || "tourlink-report.csv";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return <button type="button" onClick={download} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-extrabold text-ink shadow-soft transition hover:border-lagoon hover:text-lagoon disabled:opacity-50"><Download size={15} />{loading ? "Preparing..." : label}</button>;
}
