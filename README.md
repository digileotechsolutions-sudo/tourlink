# TourLink

TourLink is a Kenya-first tourism marketplace for trips, vehicles and trusted local providers.

## Run locally

1. Copy `.env.example` to `.env` and set `DATABASE_URL` plus a long `SESSION_SECRET`.
2. Run `npm install`.
3. Run `npm run db:push`.
4. Run `npm run db:seed` to load the Kenyan demo catalogue.
5. Run `npm run dev`.

Demo accounts use the password `TourLink123!`:

- `traveler@tourlink.ke`
- `operator1@tourlink.ke`
- `owner1@tourlink.ke`

The app uses Prisma transactions for seat reservations, signed HTTP-only session cookies for auth, and treats the M-Pesa Daraja callback as the payment source of truth. S3, M-Pesa and push-provider credentials are intentionally environment-driven.

## Django backend environment

The Django backend is being introduced as a separate migration service while the existing Next.js application remains available. It currently provides the Django project configuration and a health endpoint; domain models and feature APIs should be migrated incrementally from Prisma.

1. Install Python dependencies with `python -m pip install -r requirements-django.txt`.
2. Run `python manage.py migrate` to initialize the Django database tables.
3. Start the API with `python manage.py runserver 8000`.
4. Verify it at `http://localhost:8000/api/health/`.
5. Create a Django admin account with `python manage.py createsuperuser`.
6. Open the Django admin console at `http://localhost:8000/django-admin/`.

The Django service uses PostgreSQL when `DJANGO_DATABASE_URL` or `DATABASE_URL` is set, and falls back to a local SQLite database for first-time development. Docker Compose exposes the service on port `8000`.

## Production

Use PostgreSQL, run `prisma migrate deploy`, build with `npm run build`, and start with `npm start`. The included Dockerfile uses Next standalone output. Add an external job runner for reminder/push delivery and Socket.IO or a managed realtime provider for production chat fanout.

For shared hosting, follow [docs/CPANEL_DEPLOYMENT.md](docs/CPANEL_DEPLOYMENT.md). cPanel should run the existing Next.js app as a Node.js application and the Django migration service as a separate Python/Passenger application until the feature migration is complete.
