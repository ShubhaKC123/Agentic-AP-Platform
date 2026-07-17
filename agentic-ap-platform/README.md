# Agentic AP Platform

AI-powered Invoice Processing & Vendor Management Portal — a production-style SaaS frontend with a mock Express/Socket.io backend.

## Architecture

```
┌─────────────────┐     REST /api      ┌──────────────────┐
│  React (Vite)   │◄──────────────────►│  Express API     │
│  TanStack Query │                    │  JSON file store │
│  Zustand        │     Socket.io      │  Pipeline worker │
│  shadcn / TW    │◄──────────────────►│  (status ticks)  │
└─────────────────┘                    └──────────────────┘
```

- **Frontend**: React 19, Vite, TypeScript, Tailwind, shadcn/ui, React Router, TanStack Query, Axios, Zustand, Recharts, RHF + Zod, Framer Motion, Sonner, Socket.io client
- **Backend**: Express, TypeScript, Multer, Socket.io, Faker seed data, JSON persistence under `backend/data`
- **Realtime**: Invoice status advances every ~3s; clients receive `invoice:updated` and `notification:new` events

## Folder structure

```
agentic-ap-platform/
├── frontend/          # Vite React app
├── backend/           # Express mock API
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 20+
- npm 10+
- Docker (optional)

## Local setup

### Backend

```bash
cd backend
npm install
npm run seed   # optional — also auto-seeds on first boot
npm run dev    # http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

Copy `frontend/.env.example` to `frontend/.env` if needed:

```
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

## Docker

```bash
docker compose up --build
```

- App: http://localhost:5173
- API: http://localhost:4000/api/health

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/invoices` | Upload invoice (multipart `file`) |
| GET | `/api/invoices` | List invoices (search, filter, sort, paginate) |
| GET | `/api/invoices/:id` | Invoice detail |
| PUT | `/api/invoices/:id` | Update invoice |
| DELETE | `/api/invoices/:id` | Delete invoice |
| POST | `/api/invoices/:id/retry` | Restart processing |
| GET | `/api/dashboard` | Invoice analytics |
| GET | `/api/notifications` | Notifications |
| POST | `/api/notifications/:id/read` | Mark read |
| POST | `/api/notifications/read-all` | Mark all read |
| DELETE | `/api/notifications` | Clear all |
| POST | `/api/vendors` | Create vendor |
| GET | `/api/vendors` | List vendors |
| GET | `/api/vendors/:id` | Vendor detail |
| PUT | `/api/vendors/:id` | Update vendor |
| DELETE | `/api/vendors/:id` | Delete vendor |
| GET | `/api/vendor-dashboard` | Vendor analytics |
| GET | `/api/search?q=` | Global search |

## Modules

1. **Invoice Upload** — drag & drop PDF/PNG/JPG, progress, immediate list update  
2. **Invoice List** — filters, sort, pagination, retry/delete, live status badges  
3. **Notification Drawer** — Slack/GitHub-style drawer, unread badge, infinite scroll  
4. **Invoice Dashboard** — KPI cards + Recharts (status, per-day, vendor, processing time)  
5. **Vendor CRUD** — Zod-validated forms, search/filter/sort/pagination, CSV export  
6. **Vendor Dashboard** — country / monthly / top-vendor charts  

## Bonus features included

- Socket.io realtime (not polling)
- Command palette (`Ctrl/Cmd + K`)
- Dark mode + theme persistence
- Optimistic vendor delete
- CSV export for invoices & vendors
- Skeleton / empty / error states
- Confirmation dialogs
- Docker Compose

## Mock data

On first start (or `npm run seed`), the backend generates:

- 50 vendors  
- 200 invoices  
- 100 notifications  

Stored as JSON in `backend/data/`.

## Screenshots

Run the app locally and capture:

1. Invoice dashboard with charts  
2. Live invoice list status changes  
3. Upload page + notification drawer  




<img width="1728" height="1117" alt="Screenshot 2026-07-17 at 4 31 35 AM" src="https://github.com/user-attachments/assets/85dc1a37-a210-445e-ab2c-5d315f596580" />
<img width="1728" height="1117" alt="Screenshot 2026-07-17 at 4 31 46 AM" src="https://github.com/user-attachments/assets/2b5715fa-503d-4cfb-a1a9-18436225de3c" />
<img width="1728" height="1117" alt="Screenshot 2026-07-17 at 4 31 55 AM" src="https://github.com/user-attachments/assets/e5de8871-6209-4f56-ad55-58d307a9bbff" />
<img width="1728" height="1117" alt="Screenshot 2026-07-17 at 4 32 09 AM" src="https://github.com/user-attachments/assets/220929a0-287b-4221-b3ab-d762a533abee" />
<img width="1728" height="1117" alt="Screenshot 2026-07-17 at 4 32 18 AM" src="https://github.com/user-attachments/assets/cd0836b7-fc70-44f3-af45-f885aa8622ae" />
<img width="1728" height="1117" alt="Screenshot 2026-07-17 at 4 32 32 AM" src="https://github.com/user-attachments/assets/9fb8ca92-da6c-4d55-98ce-0c686c0b9db8" />
<img width="1728" height="1117" alt="Screenshot 2026-07-17 at 4 32 43 AM" src="https://github.com/user-attachments/assets/65ba5331-9055-4bdd-b64e-92a88698ee18" />
<img width="1728" height="1117" alt="Screenshot 2026-07-17 at 4 32 55 AM" src="https://github.com/user-attachments/assets/c826cfe6-b618-43ba-90d7-bb671e93262d" />
<img width="1728" height="1117" alt="Screenshot 2026-07-17 at 4 33 03 AM" src="https://github.com/user-attachments/assets/7eadf13d-6a0a-4f96-bcb9-058c35f1be9f" />
<img width="1728" height="1117" alt="Screenshot 2026-07-17 at 4 33 13 AM" src="https://github.com/user-attachments/assets/790282b6-4b62-42ad-bcd3-3f8c88f5b2d4" />












