import json
import secrets

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods

from .models import Booking, Destination, Trip, Vehicle


def home(request):
    return render(request, "core/home.html", {
        "destinations": Destination.objects.all()[:6],
        "trips": Trip.objects.select_related("destination").filter(status="PUBLISHED")[:6],
        "vehicles": Vehicle.objects.filter(status="PUBLISHED")[:6],
    })


def health(request):
    return JsonResponse({"status": "ok", "service": "tourlink-django"})


def _trip_data(trip):
    return {
        "id": str(trip.id), "slug": trip.slug, "name": trip.name,
        "description": trip.description, "destination": trip.destination.name,
        "departureDate": trip.departure_date.isoformat(), "returnDate": trip.return_date.isoformat(),
        "pricePerPerson": trip.price_per_person, "availableSeats": trip.available_seats,
    }


def trips(request):
    queryset = Trip.objects.select_related("destination").filter(status="PUBLISHED")
    destination = request.GET.get("destination")
    if destination:
        queryset = queryset.filter(destination__slug=destination)
    return JsonResponse({"trips": [_trip_data(trip) for trip in queryset]})


def vehicles(request):
    queryset = Vehicle.objects.select_related("destination").filter(status="PUBLISHED")
    return JsonResponse({"vehicles": [{
        "id": str(vehicle.id), "slug": vehicle.slug, "name": vehicle.name,
        "location": vehicle.location, "pricePerDay": vehicle.price_per_day,
        "seatingCapacity": vehicle.seating_capacity, "fourByFour": vehicle.four_by_four,
    } for vehicle in queryset]})


@require_http_methods(["POST"])
def bookings(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    try:
        payload = json.loads(request.body)
        trip = Trip.objects.get(slug=payload["tripSlug"], status="PUBLISHED")
        travelers = max(1, int(payload.get("travelers", 1)))
    except (KeyError, TypeError, ValueError, json.JSONDecodeError, Trip.DoesNotExist):
        return JsonResponse({"error": "A valid tripSlug and travelers value are required"}, status=400)
    if travelers > trip.available_seats:
        return JsonResponse({"error": "Not enough seats available"}, status=409)
    total = trip.price_per_person * travelers
    booking = Booking.objects.create(
        reference=f"TL-{secrets.token_hex(5).upper()}", traveler=request.user, trip=trip,
        start_date=trip.departure_date, end_date=trip.return_date,
        travelers=travelers, base_amount=total, total_amount=total,
    )
    return JsonResponse({"reference": booking.reference, "status": booking.status}, status=201)
