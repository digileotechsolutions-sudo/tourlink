import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin-dashboard";
import { ReportDownloadButton } from "@/components/report-download-button";
export default async function AdminPage() { const user = await getCurrentUser(); if (!user) redirect("/admin/login"); if (user.role !== "ADMIN") redirect("/dashboard"); return <><div className="container-page flex justify-end pt-7"><ReportDownloadButton label="Download platform report" /></div><AdminDashboard /></>; }
