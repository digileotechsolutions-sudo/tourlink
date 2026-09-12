from django.contrib import admin

from .models import Booking, Destination, Payment, Review, Trip, TripCategory, Vehicle

admin.site.site_header = "TourLink Administration"
admin.site.site_title = "TourLink Admin"
admin.site.index_title = "Marketplace management"
admin.site.register([Destination, TripCategory, Trip, Vehicle, Booking, Payment, Review])
