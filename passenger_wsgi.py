import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

from backend.wsgi import application


# cPanel Passenger loads this WSGI callable for the Django application.
