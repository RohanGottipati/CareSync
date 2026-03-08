# CareSync Backend — Plan & Architecture

## 1. Audit: How the frontend talks to the backend

- **Base URL:** All API calls go to `http://localhost:3001/api` (see `frontend/src/api.js` and `frontend/src/useApi.js`).
- **Auth:** The frontend uses Auth0 and sends `Authorization: Bearer <access_token>` on every request. The backend validates JWTs with `express-oauth2-jwt-bearer` and reads the custom claim `https://wardround.app/roles` to enforce **psw**, **family**, and **coordinator**.
- **No hardcoded endpoints yet:** The UI uses a generic `fetchWithAuth(endpoint, options)` helper; no specific routes are called from the frontend today. The backend exposes the following so the frontend can be wired up:
  - `GET /api/briefings/:clientId` — pre-visit briefing (Handoff agent).
  - `POST /api/visits` — log visit + write to Backboard memory.
  - `POST /api/family/draft` — draft message to family (Family Comms agent).
  - `POST /api/documents/upload` — multipart file upload → Vultr → async Backboard RAG.
  - `GET/POST /api/clients` — coordinator CRUD (stub).

---

## 2. Step-by-step implementation summary

| Step | What was done |
|------|----------------|
| **Backend init** | Node/Express in `caresync/backend` with **express**, **cors**, **dotenv**, **bull**, **ioredis**, **@aws-sdk/client-s3**, **@aws-sdk/s3-request-presigner**, **express-oauth2-jwt-bearer**, **multer**, **node-cron**. |
| **Vultr storage** | `services/vultrStorage.js`: S3-compatible client for Vultr Object Storage — upload PDFs, get signed URLs, get/delete objects. |
| **Queue** | `queue.js`: Bull queue `caresync:documents` backed by Redis for async document processing. |
| **Backboard** | `services/backboard.js`: createThread, writeMemory, runAgent, uploadDoc; agent types handoff / sentinel / family. |
| **Auth & roles** | `middleware/auth.js`: Auth0 JWT validation + `requireRole('psw'|'family'|'coordinator')` gating routes. |
| **Cron** | `cron.js`: 2 AM America/Toronto Medication Sentinel (production only) via node-cron. |
| **Routes** | Briefings, visits, family/draft, documents/upload, clients wired to Backboard/Vultr/DB; worker started in `server.js`. |

---

## 3. Why Vultr (Toronto, 24/7, scalability)

- **Toronto VPS:** The app runs on a Vultr VPS in Toronto so that server-side logic, Redis, and cron run in one Canadian region — good for latency and data residency expectations for Canadian care data.
- **Object Storage (S3-compatible):** Vultr Object Storage is used for PDF/document uploads. It’s S3-compatible (we use the AWS SDK), so the same code could target AWS or another S3-compatible provider if needed. **Toronto is not currently a Vultr Object Storage region;** the closest option used here is **New Jersey (ewr1)**. Keeping compute and Redis in Toronto and using EWR for object storage is a common pattern until a Canadian bucket region exists. Object storage gives 24/7 availability for uploads/downloads independent of the Node process.
- **Redis + Bull on the VPS:** Background jobs (e.g. document processing for Backboard RAG) run on the same Toronto VPS via Bull and a local Redis instance. That keeps job data in Canada and allows 24/7 processing without depending on a user’s machine or a serverless cron in another region. For scale, Redis can later be moved to a managed service (e.g. Vultr Managed Redis if offered) without changing the queue API.
- **Cron on the VPS:** The 2 AM Medication Sentinel runs with node-cron on the server in the `America/Toronto` timezone, so scheduling and execution stay on the same host and region.

---

## 4. Vultr services that fit this project

- **Vultr VPS (Toronto):** Primary compute for the Node backend, Redis, and cron. Already assumed.
- **Vultr Object Storage (EWR):** Document storage (PDFs) with S3-compatible API; credentials from the Vultr portal.
- **Optional later:** Managed Database (if we move from JSON file to Postgres/MySQL) and Managed Redis for higher availability; both can be in the same or nearby region for low latency and clearer data residency.

---

## 5. File-by-file summary

| File | Purpose |
|------|--------|
| `server.js` | Express app, CORS, Auth0 + role-protected routes, starts document worker and cron. |
| `middleware/auth.js` | Auth0 JWT validation; `extractUser` (role from custom claim); `requireRole(...)` middleware. |
| `services/vultrStorage.js` | Vultr Object Storage (S3): upload, get, signed URL, delete. |
| `queue.js` | Bull queue + Redis; `addDocumentJob()` for document processing. |
| `services/backboard.js` | Backboard: createThread, writeMemory, runAgent, getAssistantId, uploadDoc. |
| `cron.js` | 2 AM Medication Sentinel (production, America/Toronto). |
| `workers/documentWorker.js` | Processes document jobs: download from Vultr, upload to Backboard thread for RAG. |
| `routes/briefings.js` | GET briefing via Handoff agent (get/create client thread, runAgent). |
| `routes/visits.js` | POST visit, persist to DB, writeMemory to client Handoff thread. |
| `routes/family.js` | POST draft via Family Comms agent. |
| `routes/documents.js` | POST upload: Multer → Vultr → addDocumentJob. |
| `db.js` | JSON file DB + getClientThread / setClientThread for Backboard thread IDs. |

---

## 6. Environment variables (.env)

See `.env.example`. Required for full operation:

- **Auth0:** `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`
- **Backboard:** `BACKBOARD_API_KEY`, `BACKBOARD_BASE_URL`, `BACKBOARD_HANDOFF_AGENT_ID`, `BACKBOARD_SENTINEL_AGENT_ID`, `BACKBOARD_FAMILY_AGENT_ID`
- **Vultr Object Storage:** `VULTR_STORAGE_ACCESS_KEY`, `VULTR_STORAGE_SECRET_KEY`, `VULTR_STORAGE_ENDPOINT` (e.g. `https://ewr1.vultrobjects.com`), `VULTR_STORAGE_BUCKET`
- **Redis:** `REDIS_URL` (e.g. `redis://localhost:6379`)
- **App:** `PORT`, `CORS_ORIGIN`, `NODE_ENV` (use `production` for cron)

---

## 7. Running the backend

```bash
# Install dependencies
cd caresync/backend && npm install

# Redis must be running (e.g. redis-server or Docker)
# Then:
npm run dev
# or
npm start
```

Health: `GET /health` returns `{ "status": "ok" }`.
