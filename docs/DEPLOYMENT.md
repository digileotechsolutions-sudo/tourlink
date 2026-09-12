# Deployment

1. Provision PostgreSQL and an S3-compatible bucket.
2. Set the variables in `.env.example` in the cloud secret manager.
	Production requires `RESEND_API_KEY`, `EMAIL_FROM`, `AT_USERNAME`, and `AT_API_KEY`. Keep `OTP_DEV_MODE=false`; verification codes are never returned by the API in production.
3. Install dependencies and run `npx prisma migrate deploy` against the production database.
4. Run `npm run build` and `npm start`, or build the included Dockerfile.
5. Configure Daraja's callback URL as `https://your-domain.example/api/mpesa/callback`.
6. Put the application behind HTTPS. Secure cookies, push subscription, and Daraja callbacks all rely on HTTPS in production.
7. Configure an external worker for trip reminders, email delivery, push delivery, payout runs and image processing.

The health probe is `GET /api/health`. The app emits the service worker and PWA manifest during a production build. The generated service worker is intentionally ignored by git because it is a build artifact.
