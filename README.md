# TourLink

TourLink is a Kenya-first tourism marketplace for trips, vehicles and trusted local providers, served by Django.

## Run locally

1. Install Python dependencies with `python -m pip install -r requirements-django.txt`.
2. Set `DJANGO_SECRET_KEY` and `DJANGO_DATABASE_URL`.
3. Run `python manage.py migrate`.
4. Create an admin account with `python manage.py createsuperuser`.
5. Start the app with `python manage.py runserver`.

The Django app exposes the homepage plus `/api/health/`, `/api/trips/`, `/api/vehicles/`, and `/api/bookings/`. Integration credentials remain environment-driven.

The Django service uses PostgreSQL when `DJANGO_DATABASE_URL` or `DATABASE_URL` is set, and falls back to SQLite for local development.

## Production

Use PostgreSQL, run `python manage.py migrate --noinput`, collect static files with `python manage.py collectstatic --noinput`, and serve with cPanel Passenger using `passenger_wsgi.py`.

For shared hosting, follow [docs/CPANEL_DEPLOYMENT.md](docs/CPANEL_DEPLOYMENT.md). cPanel should run this project as a Python application; Node.js is not required for the primary app.
