import { redirect } from "next/navigation";
import { getOperator } from "@/lib/operator";
import { getOperatorProfile } from "@/lib/operator";
import { OperatorProfileForm } from "@/components/operator-profile-form";
export default async function CompanyProfilePage() { try { const user = await getOperator(); const profile = await getOperatorProfile(user.id); if (!profile) redirect("/dashboard"); return <OperatorProfileForm initial={profile} />; } catch { redirect("/dashboard"); } }
