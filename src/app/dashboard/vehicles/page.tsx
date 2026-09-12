import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OperatorVehicles } from "@/components/operator-extra-views";
import { VehicleOwnerVehicles } from "@/components/vehicle-owner-vehicles";
export default async function VehiclesPage() { const user = await getCurrentUser(); if (!user || !["OPERATOR", "VEHICLE_OWNER"].includes(user.role)) redirect("/dashboard"); if (user.role === "VEHICLE_OWNER") { const vehicles = await prisma.vehicle.findMany({ where: { ownerId: user.id, status: { not: "ARCHIVED" } }, include: { images: true }, orderBy: { createdAt: "desc" } }); return <VehicleOwnerVehicles initial={vehicles} />; } const vehicles = await prisma.vehicle.findMany({ where: { status: "PUBLISHED" }, select: { id: true, name: true, location: true, seatingCapacity: true, pricePerDay: true, verificationStatus: true }, orderBy: { createdAt: "desc" } }); return <OperatorVehicles vehicles={vehicles.map(vehicle => ({ id: vehicle.id, name: vehicle.name, location: vehicle.location, seats: vehicle.seatingCapacity, price: vehicle.pricePerDay, verified: vehicle.verificationStatus }))} />; }
