import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VerificationPanel } from "@/components/verification-panel";
export default async function VerificationPage() { const user = await getCurrentUser(); if (!user || !["OPERATOR", "VEHICLE_OWNER"].includes(user.role)) redirect("/dashboard"); const requests = await prisma.verificationRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }); return <VerificationPanel requests={requests.map(request => ({ id: request.id, type: request.type, status: request.status, notes: request.notes, createdAt: request.createdAt.toISOString() }))} />; }
