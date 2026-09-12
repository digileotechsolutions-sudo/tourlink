from django.urls import path

from .views import bookings, health, trips, vehicles

urlpatterns = [
    path("health/", health, name="health"),
    path("trips/", trips, name="trips"),
    path("vehicles/", vehicles, name="vehicles"),
    path("bookings/", bookings, name="bookings"),
]
