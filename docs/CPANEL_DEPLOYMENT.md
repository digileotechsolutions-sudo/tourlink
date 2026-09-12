# cPanel deployment

TourLink is deployed as a Django application through cPanel Passenger. Node.js and Next.js are not required for the primary site.

## Setup Python App

1. Upload the repository to a private directory such as `/home/CPANEL_USER/tourlink`.
2. In **Setup Python App**, choose Python 3.11 or newer.
3. Set the application root to the directory containing `manage.py`.
4. Set the startup file to `passenger_wsgi.py`.
5. Set the entry point to `application`.
6. Add these environment variables in cPanel:

```text
DJANGO_DEBUG=false
DJANGO_SECRET_KEY=<long-random-secret>
DJANGO_ALLOWED_HOSTS=your-domain.example,www.your-domain.example
DJANGO_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
DJANGO_SECURE_SSL_REDIRECT=true
DJANGO_SECURE_HSTS_SECONDS=31536000
```

Install dependencies in the Python virtual environment created by cPanel:

```bash
pip install -r requirements-django.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

Restart the application and verify:

```text
https://your-domain.example/
https://your-domain.example/api/health/
https://your-domain.example/django-admin/
```

## Database

Create a PostgreSQL database and user in cPanel. Use the complete PostgreSQL connection string as `DJANGO_DATABASE_URL`. Django migrations create the marketplace tables for destinations, trips, vehicles, bookings, payments, and reviews.

Do not place database passwords in GitHub, committed `.env` files, or public files. Rotate any password that has been exposed and update the cPanel environment variable.