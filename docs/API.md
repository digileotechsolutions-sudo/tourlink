# TourLink API

All JSON endpoints use same-origin HTTP requests. Session authentication is stored in the `tourlink_session` HTTP-only cookie.

## Authentication

### `POST /api/auth/register`

```json
{ "name": "Amina Kariuki", "email": "traveler@example.com", "password": "at-least-8-chars", "role": "TRAVELER" }
```

Supported roles are `TRAVELER`, `OPERATOR`, and `VEHICLE_OWNER`.

### `POST /api/auth/login`

```json
{ "email": "traveler@example.com", "password": "at-least-8-chars" }
```

### `POST /api/auth/logout` and `GET /api/auth/me`

## Catalog and bookings

- `GET /api/trips?search=maasai` returns published trips with destination, category and images.
- `POST /api/bookings` creates a trip booking in a Prisma transaction and reserves seats atomically.
- `POST /api/payments/mpesa/stk` starts an STK push for the authenticated user's pending booking. The phone must be in Daraja format, for example `254712345678`.
- `POST /api/mpesa/callback` is the Daraja callback. It correlates using the stored CheckoutRequestID and is the only path that changes a payment to `SUCCESSFUL`.
- `GET /api/health` checks database connectivity for deployment probes.
- `GET /api/conversations` lists only conversations for the authenticated user.
- `POST /api/conversations` starts a conversation with `{ participantId, bookingId?, body }`.
- `GET|POST /api/conversations/:id/messages` reads or sends messages after participant authorization.

## Production notes

Set `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL` and Daraja credentials in the deployment environment. Never accept a client-side payment redirect as proof of payment. Put an authenticated Socket.IO gateway or managed realtime service in front of the `Conversation`, `Message` and `Notification` models for multi-instance fanout; the database remains the source of truth.
