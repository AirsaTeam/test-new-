# Shinas Port – Shipping Cargo Management (shipingCompany)

Angular 19 frontend for **Shinas Port** (World Modern Lights LLC): passenger & cargo booking, boarding cards, and integration with the Django shipping backend.

## Prerequisites

- Node.js 18+ and npm
- Django backend running at `http://localhost:8000` for local development (or use the dev proxy)

## Development server

```bash
npm install
ng serve
```

Open **http://localhost:4200/**. The app will proxy `/api` to `http://localhost:8000` (see **Backend & API** below).

## Building

```bash
ng build
```

Output: **`dist/shiping-company`**.

Production build (uses `environment.prod.ts`):

```bash
ng build --configuration production
```

## Backend & API

- The app calls the **Django backend** at `/api/bookings/` for creating bookings.
- **Development:** With `ng serve`, requests to `/api` are proxied to `http://localhost:8000` via `proxy.conf.json`. Start your Django server on port 8000.
- **Production:** Edit `src/environments/environment.prod.ts` and set `apiBaseUrl` to your deployed API (e.g. `https://api.yourdomain.com/api`). Default is `/api` (same origin).

## Environment config

| File | Use |
|------|-----|
| `src/environments/environment.ts` | Development (`ng serve`, `ng build`) |
| `src/environments/environment.prod.ts` | Production (`ng build --configuration production`) |

Change `apiBaseUrl` in the relevant file to point to your backend (no trailing slash).

## Project structure

- **`src/app/components/`** – Booking form, booking summary (ticket/boarding card).
- **`src/app/services/booking.service.ts`** – HTTP client for `/api/bookings/`.
- **`src/app/models/booking-request.model.ts`** – Booking request/response type.

## Running tests

```bash
ng test
```

## Additional resources

- [Angular CLI](https://angular.dev/tools/cli)
- [Shinas Port PRD](.) – Product requirements (English UI, Persian docs).
