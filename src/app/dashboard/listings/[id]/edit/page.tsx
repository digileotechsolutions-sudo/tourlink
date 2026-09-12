import { notFound, redirect } from "next/navigation";
import { getOperator } from "@/lib/operator";
import { prisma } from "@/lib/prisma";
import { TripEditor } from "@/components/trip-editor";
export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) { try { const user = await getOperator(); const { id } = await params; const trip = await prisma.trip.findFirst({ where: { id, operatorId: user.id }, include: { images: { orderBy: { sortOrder: "asc" } } } }); if (!trip) notFound(); return <TripEditor editId={trip.id} initial={{ ...trip, departureDate: trip.departureDate.toISOString(), returnDate: trip.returnDate.toISOString(), itinerary: trip.itinerary, images: trip.images.map(image => ({ url: image.url })) }} />; } catch { redirect("/dashboard/listings"); } }
