import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export function bookingReference() { return `TL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }

export async function createTripBooking(input: { userId: string; tripId: string; travelers: number; pickupLocation?: string; startDate: Date }) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: input.tripId } }) ?? await tx.trip.findUnique({ where: { slug: input.tripId } });
    if (!trip || trip.status !== "PUBLISHED") throw new Error("TRIP_UNAVAILABLE");
    const reserved = await tx.trip.updateMany({ where: { id: trip.id, status: "PUBLISHED", availableSeats: { gte: input.travelers } }, data: { availableSeats: { decrement: input.travelers } } });
    if (!reserved.count) throw new Error("NOT_ENOUGH_SEATS");
    const total = trip.pricePerPerson * input.travelers;
    const booking = await tx.booking.create({ data: { reference: bookingReference(), type: "TRIP", travelerId: input.userId, tripId: trip.id, startDate: input.startDate, endDate: trip.returnDate, travelers: input.travelers, pickupLocation: input.pickupLocation, baseAmount: total, totalAmount: total, currency: "KES" } });
    await tx.payment.create({ data: { bookingId: booking.id, merchantReference: booking.reference, amount: total } });
    await tx.commission.create({ data: { bookingId: booking.id, rate: 0.1, grossAmount: total, commissionAmount: Math.round(total * 0.1), providerAmount: total - Math.round(total * 0.1) } });
    await tx.notification.create({ data: { userId: trip.operatorId, title: "New trip booking", body: `${booking.reference} is waiting for your confirmation.`, type: "BOOKING" } });
    return booking;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function createVehicleBooking(input: { userId: string; vehicleId: string; startDate: Date; endDate: Date; driverRequired: boolean; pickupLocation?: string }) {
  return prisma.$transaction(async (tx) => {
    if (input.endDate <= input.startDate) throw new Error("INVALID_DATES");
    const vehicle = await tx.vehicle.findUnique({ where: { id: input.vehicleId } }) ?? await tx.vehicle.findUnique({ where: { slug: input.vehicleId } });
    if (!vehicle || vehicle.status !== "PUBLISHED") throw new Error("VEHICLE_UNAVAILABLE");
    const overlap = await tx.booking.findFirst({ where: { vehicleId: vehicle.id, status: { notIn: ["CANCELLED", "REFUNDED"] }, startDate: { lt: input.endDate }, endDate: { gt: input.startDate } }, select: { id: true } });
    if (overlap) throw new Error("VEHICLE_BOOKED");
    const days = Math.max(1, Math.ceil((input.endDate.getTime() - input.startDate.getTime()) / 86400000));
    const total = vehicle.pricePerDay * days;
    const booking = await tx.booking.create({ data: { reference: bookingReference(), type: "VEHICLE", travelerId: input.userId, vehicleId: vehicle.id, startDate: input.startDate, endDate: input.endDate, driverRequired: input.driverRequired, pickupLocation: input.pickupLocation, baseAmount: total, totalAmount: total, currency: "KES" } });
    await tx.payment.create({ data: { bookingId: booking.id, merchantReference: booking.reference, amount: total } });
    await tx.commission.create({ data: { bookingId: booking.id, rate: 0.1, grossAmount: total, commissionAmount: Math.round(total * 0.1), providerAmount: total - Math.round(total * 0.1) } });
    await tx.notification.create({ data: { userId: vehicle.ownerId, title: "New vehicle request", body: `${booking.reference} is waiting for your response.`, type: "VEHICLE_BOOKING" } });
    return booking;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
