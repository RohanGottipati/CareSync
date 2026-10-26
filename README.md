# CareSync

AI-assisted home care coordination for Personal Support Workers (PSWs), families, and care coordinators — shift briefings, visit logging, overnight medication checks, and family updates in one app.

Built as a hackathon project for the Canadian home care context: the backend runs on a Vultr VPS in Toronto, with AI agents powered by Backboard.io and identity by Auth0.

## Features

- **Pre-visit briefings** — the Backboard *Handoff* agent generates a short briefing for the incoming PSW from the client's profile, visit history, medications, and flagged concerns (`GET /api/briefings/:clientId`).
- **Visit logging** — PSWs log visit notes and session type; each visit is stored in PostgreSQL and written to the client's Backboard memory thread so later briefings stay current.
- **Medication Sentinel** — a nightly job (2 AM America/Toronto) asks the *Sentinel* agent to review every client's medications and conditions, stores a `FLAGGED`/`CLEAR` result per client, and emails the coordinator when anything is flagged.
- **Family portal** — a nightly job (1 AM) uses the *Family* agent to write a plain-language daily summary for each client visited that day, stores it, and emails family members who have an email on file. Families can view summaries and documents and upload documents.
- **Document management** — upload PDF, DOCX, JPG, or PNG files (up to 10 MB) to Vultr Object Storage. When Redis is configured, a Bull worker also uploads them to the client's Backboard threads for retrieval.
- **Coordinator dashboard** — client CRUD, PSW shift assignments, sentinel results, client documents, and assigning roles to new users via the Auth0 Management API.
- **Role-based access** — Auth0 roles (`psw`, `family`, `coordinator`) from the `https://wardround.app/roles` token claim are enforced on frontend routes and backend middleware.

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 18, Vite 5, React Router 6, Tailwind CSS 4, Framer Motion, Lucide icons, Spline (landing page 3D scene), `@auth0/auth0-react` |
| Backend | Node.js, Express 4 (ES modules), `express-oauth2-jwt-bearer`, `pg`, `node-cron`, Bull (optional, Redis), Multer, AWS SDK v3 S3 client, Resend |
| Services | Auth0, Backboard.io (AI assistants + memory threads), Vultr Managed PostgreSQL, Vultr Object Storage (S3-compatible), Resend (email) |
| Hosting | Backend on a Vultr VPS with PM2; frontend on Vercel |

## Architecture

```
Frontend (Vercel)          Backend (Vultr VPS)            External Services
┌──────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│  React + Vite    │──────▶│  Node/Express        │──────▶│  Backboard.io   │
│  Auth0 SPA       │ /api  │  PM2 process manager │       │  (AI agents)    │
│  Tailwind CSS    │ proxy │  node-cron (nightly) │       ├─────────────────┤
└──────────────────┘       └──────────┬───────────┘       │  Auth0          │
                                      │                    │  (identity)     │
                                      ├───────────────────▶├─────────────────┤
                                      │                    │  Vultr Object   │
                                      │                    │  Storage (S3)   │
                                      ├───────────────────▶├─────────────────┤
                                      │                    │  Vultr Managed  │
                                      │                    │  PostgreSQL     │
                                      └───────────────────▶├─────────────────┤
                                                           │  Resend (email) │
                                                           └─────────────────┘
```

## Project Structure

```
vercel.json                     # Vercel build config (builds caresync/frontend) + rewrites
caresync/
├── backend/                    # Node.js + Express API
│   ├── server.js               # Entry point: CORS, route mounting, schema init, worker + cron start
│   ├── schema.js               # Creates all PostgreSQL tables on boot (initSchema)
│   ├── db.js                   # PostgreSQL pool + data access functions
│   ├── cron.js                 # Nightly Family Summaries (1 AM) + Medication Sentinel (2 AM)
│   ├── queue.js                # Bull queue (enabled only when REDIS_URL is set)
│   ├── middleware/auth.js      # Auth0 JWT validation + role enforcement
│   ├── routes/
│   │   ├── briefings.js        # GET  /api/briefings/:clientId
│   │   ├── visits.js           # POST /api/visits
│   │   ├── family.js           # GET  /api/family/summaries, POST /api/family/draft
│   │   ├── documents.js        # POST /api/documents/upload, GET /api/documents
│   │   ├── clients.js          # /api/clients — client CRUD, assignments, sentinel results
│   │   ├── admin.js            # /api/admin — Auth0 user/role management
│   │   └── debug.js            # /api/debug — manual job triggers (not mounted in production)
│   ├── services/
│   │   ├── backboard.js        # Backboard.io API (threads, agents, memory, documents)
│   │   ├── vultrStorage.js     # S3-compatible upload/download
│   │   └── email.js            # Resend: family updates + coordinator alerts
│   ├── workers/
│   │   └── documentWorker.js   # Bull worker: uploads stored documents to Backboard threads
│   ├── scripts/
│   │   ├── run-schema.js           # Standalone schema migration runner
│   │   ├── seed-margaret-chen.js   # Demo data: Margaret Chen
│   │   └── seed-john-stone.js      # Demo data: John Stone
│   └── BACKEND_PLAN.md         # Backend design notes
│
└── frontend/                   # React + Vite SPA
    ├── public/caresync-logo.png
    ├── src/
    │   ├── main.jsx            # React root + Auth0 provider
    │   ├── App.jsx             # Router, role-based navigation and routes
    │   ├── auth0-provider.jsx  # Auth0 React provider
    │   ├── useApi.js           # Authenticated fetch hooks (fetchWithAuth, uploadWithAuth)
    │   ├── lib/utils.js        # cn() class-name helper
    │   ├── pages/
    │   │   ├── LandingPage.jsx         # Public landing page
    │   │   ├── AboutPSW.jsx            # Public role pages
    │   │   ├── AboutFamily.jsx
    │   │   ├── AboutCoordinator.jsx
    │   │   ├── PSWDashboard.jsx
    │   │   ├── FamilyPortal.jsx
    │   │   └── CoordinatorDashboard.jsx
    │   └── components/
    │       ├── NavBar.jsx
    │       ├── BriefingCard.jsx
    │       ├── VisitLogger.jsx
    │       ├── DocumentUpload.jsx
    │       └── MedicationFlags.jsx
    └── vercel.json             # SPA rewrites + /api proxy to the backend
```

`PROJECT.md` at the repo root is the original architecture guide (an HTML document, written under the project's earlier name, WardRound).

## Prerequisites

- Node.js 20+ and npm (Tailwind CSS 4, Resend, and the AWS SDK require Node 20)
- A PostgreSQL database (local or Vultr Managed PostgreSQL) — the server requires `DATABASE_URL` and creates its tables on startup
- An Auth0 tenant with an SPA application, an API (audience), a Machine-to-Machine app for the admin routes, the roles `psw`, `family`, `coordinator`, with the user's roles added to the `https://wardround.app/roles` access-token claim (e.g. via an Auth0 Action)
- A Backboard.io API key and three assistants (Handoff, Sentinel, Family)
- Vultr Object Storage (or another S3-compatible bucket) for document uploads
- Optional: Redis (for background document indexing) and a Resend API key (for emails)

## Local Development

### Backend

```bash
cd caresync/backend
cp .env.example .env    # fill in Auth0, Backboard, Vultr, database, and Resend values
npm install
npm run dev             # nodemon; listens on PORT (4000 in .env.example, 3001 if unset)
```

All tables are created on boot by `initSchema()`. To run the schema step on its own or load demo data:

```bash
node scripts/run-schema.js
node scripts/seed-margaret-chen.js
node scripts/seed-john-stone.js
```

Health check: `GET /health` → `{ "status": "ok" }`.

With `NODE_ENV` not set to `production`, the nightly jobs are not scheduled; trigger them manually instead (the coordinator dashboard's sentinel button uses the first one):

- `POST /api/debug/sentinel`
- `POST /api/debug/family-summaries`

### Frontend

```bash
cd caresync/frontend
cp .env.example .env.local   # fill in VITE_AUTH0_* and set VITE_API_URL to the backend URL
npm install
npm run dev                  # Vite dev server on http://localhost:5173
```

## Available Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `caresync/backend` | `npm start` | Start the API with Node |
| `caresync/backend` | `npm run dev` | Start the API with nodemon (auto-reload) |
| `caresync/frontend` | `npm run dev` | Vite dev server |
| `caresync/frontend` | `npm run build` | Production build to `dist/` |
| `caresync/frontend` | `npm run preview` | Serve the production build locally |
| `caresync/frontend` | `npm run lint` | ESLint (note: no ESLint config file is committed yet, so this currently exits with a config error) |

## Environment Variables

Copy `caresync/backend/.env.example` and `caresync/frontend/.env.example`; they include where to find each value.

### Backend (`caresync/backend/.env`)

| Variable | Purpose |
|----------|---------|
| `AUTH0_DOMAIN` | Auth0 tenant domain (JWT issuer, Management API) |
| `AUTH0_AUDIENCE` | Auth0 API identifier expected in access tokens |
| `AUTH0_M2M_CLIENT_ID` / `AUTH0_M2M_CLIENT_SECRET` | Machine-to-Machine credentials for `/api/admin` role management |
| `BACKBOARD_API_KEY` | Backboard.io API key |
| `BACKBOARD_BASE_URL` | Backboard API base URL (defaults to `https://app.backboard.io/api`) |
| `BACKBOARD_HANDOFF_AGENT_ID` / `BACKBOARD_SENTINEL_AGENT_ID` / `BACKBOARD_FAMILY_AGENT_ID` | Backboard assistant IDs for briefings, medication checks, and family summaries |
| `VULTR_STORAGE_ACCESS_KEY` / `VULTR_STORAGE_SECRET_KEY` | Object storage credentials |
| `VULTR_STORAGE_ENDPOINT` / `VULTR_STORAGE_REGION` / `VULTR_STORAGE_BUCKET` | Object storage endpoint, region (default `ewr1`), and bucket |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Optional — enables the Bull queue/worker for background document indexing |
| `PORT` | HTTP port (defaults to 3001) |
| `CORS_ORIGIN` | Comma-separated allowed origins; in non-production any `localhost` origin is also allowed |
| `NODE_ENV` | `production` schedules the nightly jobs and disables `/api/debug` |
| `RESEND_API_KEY` / `RESEND_FROM` | Email delivery and sender address |
| `COORDINATOR_EMAIL` | Recipient of the nightly sentinel alert |
| `APP_URL` | Link included in coordinator alert emails (falls back to `CORS_ORIGIN`) |

### Frontend (`caresync/frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `VITE_AUTH0_DOMAIN` | Auth0 domain for the SPA |
| `VITE_AUTH0_CLIENT_ID` | Auth0 SPA client ID |
| `VITE_AUTH0_AUDIENCE` | Must match the backend `AUTH0_AUDIENCE` |
| `VITE_API_URL` | Backend origin for local dev (e.g. `http://localhost:4000`); leave unset in production so requests go to `/api` |

## Database

PostgreSQL with 7 tables, all created on server boot (`schema.js`):

- `clients` — client profiles (medications, conditions, notes, family members)
- `client_threads` — Backboard thread IDs per client per agent type
- `visits` — PSW visit logs
- `assignments` — PSW-to-client shift assignments
- `client_sentinel_results` — latest overnight medication sentinel result per client
- `family_daily_summaries` — nightly family-friendly care updates
- `documents` — uploaded document metadata

## Deployment

### Backend — Vultr VPS

The backend runs on a Vultr VPS under PM2. Redis is optional; without `REDIS_URL` uploads still go to object storage but background Backboard indexing is skipped.

```bash
# On the VPS
cd /app/backend
npm install
pm2 start server.js --name caresync-api
pm2 startup && pm2 save
```

Key production `.env` settings:

- `NODE_ENV=production` (schedules nightly jobs, hides `/api/debug`)
- `PORT=4000` (the port `vercel.json` proxies to)
- `CORS_ORIGIN=https://<your-vercel-domain>`
- `DATABASE_URL=postgresql://...` (Vultr Managed PostgreSQL)

### Frontend — Vercel

The Vercel project builds from the repository root. The root `vercel.json` installs and builds `caresync/frontend` and serves `caresync/frontend/dist`; it also rewrites `/api/*` to the backend VPS (avoiding mixed content between the HTTPS frontend and HTTP backend) and serves `index.html` for all other routes. `caresync/frontend/vercel.json` holds the same rewrites for CLI deploys run from `caresync/frontend` (or a project whose Root Directory is set to `caresync/frontend`); keep the two in sync.

Set `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, and `VITE_AUTH0_AUDIENCE` in Vercel. Leave `VITE_API_URL` unset so `useApi.js` uses `/api`.
