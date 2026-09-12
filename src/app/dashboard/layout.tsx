import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { ReportDownloadButton } from "@/components/report-download-button";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) { const user = await getCurrentUser(); if (!user) redirect("/login"); const canReport = user.role === "OPERATOR" || user.role === "VEHICLE_OWNER"; return <DashboardShell user={user}><div className="mb-4 flex justify-end">{canReport && <ReportDownloadButton />}</div>{children}</DashboardShell>; }
