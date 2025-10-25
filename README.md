# LMGa Construction Solutions Platform

This repository hosts both halves of the LMGa Construction Solutions marketplace:

- `backend/` – Django 5 + DRF + PostGIS API for authentication, catalog, orders, and payments.
- `frontend/` – Next.js 15 (App Router, TypeScript, Tailwind) for browsing materials and wiring future workflows.

## Project Layout
x`
```
.
├── backend/                  # Django project (core/, marketplace/, manage.py, etc.)
│   ├── .env                  # Runtime configuration consumed by core/settings.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # Next.js app (src/app/products shows live catalog)
│   ├── .env.local.example    # Frontend environment template
│   └── Dockerfile
├── docker-compose.yml        # Spins up backend, frontend, PostGIS, Redis, MinIO
└── venv/                     # (Optional) local virtualenv from earlier work
```

## Quick Start (Docker)

```bash
docker compose up --build -d                # backend, frontend, db, redis, minio
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser --phone 255700000000
# optional demo fixtures
docker compose exec backend python manage.py seed_demo
```

`seed_demo` now provisions a demo buyer, a seller admin, and a six-product catalogue (cement, steel, aggregates, equipment hire, and finishes) complete with imagery and descriptions for the new UI.

Once the stack is up:

- Frontend: `http://localhost:3000/products`
- Backend API: `http://localhost:8000/api/`
- MinIO: `http://localhost:9100` (console: `http://localhost:9101`)

### Environment Variables

| Component | Variable | Purpose |
| --- | --- | --- |
| Backend | `backend/.env` | DB connection, JWT lifetimes, S3 toggle. |
| Frontend | `NEXT_PUBLIC_API_BASE_URL` | Browser-facing URL (defaults to `http://localhost:8000`). |
| Frontend | `INTERNAL_API_BASE_URL` | Container-only host (`http://backend:8000`) for server-side fetches. |

Create a local frontend file if you need overrides:

```bash
cp frontend/.env.local.example frontend/.env.local
# edit values as needed
```

## Frontend Flow

- Auth pages (`/login`, `/register`) hook directly into the backend JWT endpoints and persist tokens client-side.
- `/` is now a marketing-led homepage outlining LMGa’s integrated services, supply success stories, and quick CTAs into the catalogue.
- `Dashboard` summarises the signed-in profile and guides the next actions.
- `Products` delivers a live, filterable catalogue with search, pricing filters, and interactive cards that surface stock and specification summaries.
- Every product has a detail page with immersive visuals and an integrated order flow:
  - Buyers can create an order, add the product as a line item, generate a payment request, and fire the webhook to confirm it.
- Seller tooling (for admins) lives under `/seller`; catalogue management under `/products/new` is available to admins and staff.
- Seller catalog dashboard now supports editing/deleting products, aggregate inventory metrics, reusable publishing forms, and staff invitations.
- `/orders` shows your personalised order feed (buyer or seller) and lets you append arbitrary products via the `add_item` action.
- `/payments` creates payment intents and lets you simulate PSP callbacks.
- `/webhooks` is a general-purpose tester for the unauthenticated webhook route.
- Auth tokens refresh automatically 30 seconds before expiry; failures trigger a safe logout.
- A global light/dark mode toggle lives in the navigation bar; preferences persist in localStorage.
- English and Swahili language toggle sits alongside the theme switcher; copy updates instantly without reloads.

Shared fetch logic lives in `src/lib/api.ts`, automatically swapping to the internal service URL when the code runs inside Docker. The shared layout (`src/app/layout.tsx`) wraps all pages, applies theming, and adapts navigation links based on the logged-in role.

### UI Walkthrough

1. **Register/Login** – Pick a role (buyer or seller_admin/ seller_staff). Tokens are stored locally so refreshes keep you signed in.
2. **Seller profile** – If you signed up as a seller, head to `/seller` to create the profile required by the API before publishing products.
3. **Publish products** – Use `/products/new` to push items into the catalog; the list underneath confirms what the API returned and can be edited/deleted inline.
4. **Invite seller staff** – Admins can invite teammates from `/seller`; invited staff receive a link at `/invite/<token>` to create their accounts.
5. **Browse & order** – Use the catalogue filters to locate inventory, open any product, choose quantity, and submit the order form. The UI will:
   - `POST /api/orders/` with seller auto-selected.
   - `POST /api/orders/{id}/add_item/` with your chosen quantity.
   - Offer buttons to create a payment and trigger the webhook.
6. **Manage orders** – `/orders` fetches your scoped feed (buyer or seller). Select one to append more items via product UUID.
7. **Payments & webhooks** – `/payments` issues manual payment intents for any order and calls the webhook; `/webhooks` lets you craft arbitrary payloads for deeper testing.
8. **Switch theme** – Tap the ☀️/🌙 toggle in the header to flip between light and dark palettes.

Run the Next.js app outside Docker if you prefer local tooling:

```bash
cd frontend
npm install
npm run dev -- --hostname 0.0.0.0 --port 3000
```

## Backend API Notes

All endpoints require JWT bearer tokens except where noted.

```bash
# Register buyer
curl -s -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Demo Buyer","phone":"+255700000001","password":"secret"}'

# Login and stash tokens
BUYER_TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone":"+255700000001","password":"secret"}' \
  | jq -r '.tokens.access')

# IMPORTANT: wrap the Authorization header in double quotes so the token expands.
curl -s http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

Common endpoints:

- `POST /api/sellers/` – seller admins create their business profile (user inferred).
- `POST /api/products/` – seller staff/admins list inventory (seller inferred).
- `POST /api/orders/` – buyer creates order (buyer inferred).
- `POST /api/orders/{id}/add_item/` – append a product to the order.
- `POST /api/payments/` – record a payment intent.
- `POST /api/webhooks/payments/` – unauthenticated PSP callback (new path avoids router conflicts).
- `POST /api/auth/refresh/` – exchange a refresh token for a fresh access token (used by the frontend automatically).

If you hit `{"detail":"Authorization header must contain two space-delimited values"}`, the shell most likely did not substitute the token (e.g. single quotes). Validate first:

```bash
printf 'Authorization header -> Authorization: Bearer %s\n' "$BUYER_TOKEN"
```

## Testing with Postman

1. **Create an environment**
   - `base_url = http://localhost:8000`
   - Optional: `buyer_phone`, `buyer_password`, `seller_phone`, `seller_password`
   - Empty vars: `buyer_token`, `seller_token`
2. **Register (if needed)** – `POST {{base_url}}/api/auth/register/`
3. **Login script**
   - `POST {{base_url}}/api/auth/login/` with phone/password.
   - Tests tab:
     ```js
     const data = pm.response.json();
     pm.environment.set("buyer_token", data.tokens.access);
     pm.environment.set("buyer_refresh", data.tokens.refresh);
     ```
   - Duplicate for sellers writing to `seller_token`.
4. **Use Postman’s Bearer auth** – set `Token = {{buyer_token}}` and Postman handles the header.
5. **Exercise endpoints** – sellers post catalog, buyers place orders, etc.
6. **Webhook** – `POST {{base_url}}/api/webhooks/payments/` (no auth).
7. **Refresh tokens** – rerun the login request when a 401 pops up.

## Docker Toolbox

- Stop & clean: `docker compose down`
- Backend shell: `docker compose exec backend bash`
- Backend tests: `docker compose exec backend python manage.py test`
- Celery (manual): `docker compose exec backend celery -A core worker -l info`
- Frontend logs: `docker compose logs -f frontend`

Happy building! Let me know if you want additional scripts (e.g., seeders, linting hooks, or Postman collections).
