import uuid

from django.contrib.auth.models import User
from django.db import models


class ListingStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    PUBLISHED = "PUBLISHED", "Published"
    ARCHIVED = "ARCHIVED", "Archived"


class BookingStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    CONFIRMED = "CONFIRMED", "Confirmed"
    PAID = "PAID", "Paid"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"


class Destination(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=160)
    slug = models.SlugField(unique=True)
    country = models.CharField(max_length=80, default="Kenya")
    description = models.TextField()
    image_url = models.URLField(blank=True)
    location = models.CharField(max_length=160, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class TripCategory(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class Trip(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=180)
    description = models.TextField()
    starting_point = models.CharField(max_length=160)
    ending_point = models.CharField(max_length=160)
    duration_days = models.PositiveIntegerField()
    departure_date = models.DateField()
    return_date = models.DateField()
    price_per_person = models.PositiveIntegerField()
    max_travelers = models.PositiveIntegerField()
    available_seats = models.PositiveIntegerField()
    itinerary = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=16, choices=ListingStatus.choices, default=ListingStatus.PUBLISHED)
    featured = models.BooleanField(default=False)
    operator = models.ForeignKey(User, on_delete=models.PROTECT, related_name="tourlink_trips")
    destination = models.ForeignKey(Destination, on_delete=models.PROTECT, related_name="trips")
    category = models.ForeignKey(TripCategory, on_delete=models.PROTECT, related_name="trips")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-featured", "departure_date"]
        indexes = [models.Index(fields=["status", "departure_date"])]

    def __str__(self):
        return self.name


class Vehicle(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=180)
    registration_number = models.CharField(max_length=40, unique=True)
    make = models.CharField(max_length=80)
    model = models.CharField(max_length=80)
    year = models.PositiveIntegerField()
    body_type = models.CharField(max_length=80)
    seating_capacity = models.PositiveIntegerField()
    transmission = models.CharField(max_length=40)
    fuel_type = models.CharField(max_length=40)
    air_conditioning = models.BooleanField(default=False)
    four_by_four = models.BooleanField(default=False)
    driver_included = models.BooleanField(default=False)
    price_per_day = models.PositiveIntegerField()
    location = models.CharField(max_length=160)
    status = models.CharField(max_length=16, choices=ListingStatus.choices, default=ListingStatus.PUBLISHED)
    owner = models.ForeignKey(User, on_delete=models.PROTECT, related_name="tourlink_vehicles")
    destination = models.ForeignKey(Destination, on_delete=models.SET_NULL, null=True, blank=True, related_name="vehicles")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Booking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=24, unique=True)
    status = models.CharField(max_length=16, choices=BookingStatus.choices, default=BookingStatus.PENDING)
    traveler = models.ForeignKey(User, on_delete=models.PROTECT, related_name="tourlink_bookings")
    trip = models.ForeignKey(Trip, on_delete=models.PROTECT, null=True, blank=True, related_name="bookings")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT, null=True, blank=True, related_name="bookings")
    start_date = models.DateField()
    end_date = models.DateField()
    travelers = models.PositiveIntegerField(default=1)
    base_amount = models.PositiveIntegerField()
    fees = models.PositiveIntegerField(default=0)
    total_amount = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="KES")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.reference


class Payment(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.PROTECT, related_name="payments")
    provider = models.CharField(max_length=30, default="MPESA")
    status = models.CharField(max_length=24, default="PENDING")
    merchant_reference = models.CharField(max_length=80, unique=True)
    transaction_reference = models.CharField(max_length=80, unique=True, null=True, blank=True)
    amount = models.PositiveIntegerField()
    phone_number = models.CharField(max_length=30, blank=True)
    provider_response = models.JSONField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Review(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.PROTECT, related_name="reviews")
    author = models.ForeignKey(User, on_delete=models.PROTECT, related_name="tourlink_reviews")
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviews")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviews")
    rating = models.PositiveSmallIntegerField()
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["booking", "author"], name="unique_booking_review")]