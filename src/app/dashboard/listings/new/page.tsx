import { TripEditor } from "@/components/trip-editor";
import { redirect } from "next/navigation";
import { getOperator } from "@/lib/operator";
export default async function NewTripPage() { try { await getOperator(); return <TripEditor />; } catch { redirect("/dashboard"); } }
