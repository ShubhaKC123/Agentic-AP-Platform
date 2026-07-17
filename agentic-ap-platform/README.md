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

## License

MIT — assessment / portfolio use.
