import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile-form";
export default async function ProfilePage() { const user = await getCurrentUser(); if (!user) return null; const full = await prisma.user.findUnique({ where: { id: user.id }, include: { travelerProfile: true, vehicleOwnerProfile: true } }); if (!full) return null; return <ProfileForm initial={{ name: full.name, email: full.email, phone: full.phone, avatarUrl: full.avatarUrl, bio: full.travelerProfile?.bio || full.vehicleOwnerProfile?.description || null, preferredCurrency: full.travelerProfile?.preferredCurrency || "KES" }} />; }
