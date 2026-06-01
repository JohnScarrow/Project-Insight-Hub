# Project Insight Hub

A full-stack project management platform built with React, TypeScript, Fastify, and PostgreSQL — featuring role-based access control, task tracking with parent/child relationships, time logging, and cost monitoring.

This project started as a non-functional codebase and was rebuilt into a working prototype — diagnosing broken state, wiring up the backend correctly, and getting the full auth + RBAC flow operational.

## Features

- **Authentication** — JWT-based login with bcrypt password hashing
- **Role-based access control** — three roles (Admin, Editor, Viewer) with enforced permissions throughout the UI and API
- **Project & task management** — hierarchical tasks with parent/child relationships
- **Time logging** — per-task time tracking with cost calculation
- **Audit logging** — full trail of changes across the platform
- **Demo accounts** — one-click Admin and Guest logins for quick evaluation

## Tech Stack

**Frontend:** React, TypeScript, Vite, ShadCN UI, Tailwind CSS, TanStack Query, React Router

**Backend:** Fastify, Prisma ORM, PostgreSQL, TypeScript, bcrypt, JWT

**Deployment:** Vercel (frontend), Railway or Render (backend), Neon or Railway Postgres (database)

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Setup

```bash
# Clone and install
git clone https://github.com/JohnScarrow/Project-Insight-Hub.git
cd Project-Insight-Hub
npm install
cd server && npm install && cd ..

# Configure environment
cp .env.example .env
cp server/.env.example server/.env
# Set DATABASE_URL in server/.env
```

```bash
# Run migrations and seed
cd server
npx prisma migrate dev
npx prisma generate
npm run prisma:seed
```

```bash
# Start backend (terminal 1)
cd server && npm run dev

# Start frontend (terminal 2)
npm run dev
```

Frontend runs at `http://localhost:8080`, API at `http://localhost:4000`.

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| POST | `/api/tasks` | Create task |
| POST | `/api/timelogs` | Log time |
| GET | `/api/auditlogs` | Audit log (Admin only) |

## Deployment

See `DEPLOYMENT.md` for full cloud deployment instructions.

- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Railway](https://railway.app) or [Render](https://render.com)
- **Database** → [Neon](https://neon.tech), Railway Postgres, or Render Postgres
