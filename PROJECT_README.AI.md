# Project Insight Hub

A comprehensive project tracking application built with React + TypeScript (frontend) and Fastify + Prisma (backend).

## Overview

This is a full-stack application for managing projects with features including:
- **Projects**: Create and manage multiple projects
- **Notes**: Project-specific notes and documentation
- **Docs**: Document management with metadata
- **Connections**: Store API keys and connection configs
- **Costs**: Track project expenses and service costs
- **Tasks**: Hierarchical task management (parent/child relationships)
- **Time Logs**: Track time spent on projects and tasks
- **Authentication**: User login and session management
- **RBAC**: Project-level role-based access control

## Tech Stack

### Frontend
- **Vite** - Fast build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first styling
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing

### Backend
- **Node.js 18+** - Runtime
- **Fastify 4** - Fast web framework
- **Prisma** - Modern ORM
- **TypeScript** - Type safety
- **SQLite** - Local development database
- **PostgreSQL (Neon)** - Production database
- **bcrypt** - Password hashing

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or pnpm

### Running Locally

#### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

#### 2. Start the Backend

```bash
cd server

# Quick start (handles setup automatically)
./start.sh

# OR manually:
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
npx tsc -p tsconfig.build.json
node --experimental-specifier-resolution=node dist/index.js
```

Backend will start on **http://localhost:4000**

**Seeded Admin User:**
- Email: `jdeegan@gainclarity.com`
- Password: `password`

#### 3. Start the Frontend

```bash
# From project root
npm run dev
```

Frontend will start on **http://localhost:5173**

### Testing the API

Run the included test script:

```bash
cd server
./test-api.sh
```

Or test manually with curl:

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jdeegan@gainclarity.com","password":"password"}'

# Get projects
curl http://localhost:4000/api/projects
```

## Project Structure

```
project-insight-hub/
├── src/                    # Frontend React app
│   ├── components/         # UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── AppSidebar.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Projects.tsx
│   │   ├── TimeLogs.tsx
│   │   └── projects/      # Project subpages
│   │       ├── Activity.tsx
│   │       ├── Tasks.tsx
│   │       ├── Notes.tsx
│   │       └── ...
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities
│   └── main.tsx           # App entry point
│
├── server/                # Backend API
│   ├── src/
│   │   ├── index.ts       # Server entry point
│   │   ├── plugins/       # Fastify plugins
│   │   └── routes/        # API route handlers
│   │       ├── auth.ts
│   │       ├── projects.ts
│   │       ├── notes.ts
│   │       ├── tasks.ts
│   │       └── ...
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   ├── seed.ts        # Database seeding
│   │   └── dev.db         # SQLite database (local)
│   ├── start.sh           # Quick start script
│   ├── test-api.sh        # API test script
│   └── README.md          # Backend documentation
│
├── public/                # Static assets
├── package.json           # Frontend dependencies
└── README.md              # This file
```

## API Endpoints

All endpoints are prefixed with `/api`.

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/signup` - Create new user
- `GET /auth/me` - Get current user

### Resources (CRUD)
- `/projects` - Project management
- `/notes` - Project notes
- `/docs` - Document metadata
- `/connections` - API keys and connections
- `/costs` - Cost tracking
- `/tasks` - Task management (with parent/child)
- `/timelogs` - Time tracking

Each resource supports:
- `GET /` - List all (with optional query filters)
- `POST /` - Create new
- `GET /:id` - Get by ID
- `PUT /:id` - Update
- `DELETE /:id` - Delete

See [`server/README.md`](./server/README.md) for detailed API documentation.

## Environment Setup

### Local Development (SQLite)

The backend uses SQLite by default for local development.

Create `server/.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="dev-secret-change-in-production"
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### Staging/Production (Neon PostgreSQL)

1. Create a [Neon](https://neon.tech) account and database
2. Update `server/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Create `server/.env.staging`:
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/dbname"
   JWT_SECRET="strong-random-secret"
   PORT=4000
   FRONTEND_URL=https://your-domain.com
   ```
4. Run migrations:
   ```bash
   cd server
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   ```

**⚠️ Important:** Never commit `.env` files! They are already in `.gitignore`.

## Deployment

### Backend Deployment (AWS)

Choose one of these free-tier options:

#### Option 1: AWS Lightsail
- $5/month (first month may be free)
- Simplest setup
- Includes static IP

#### Option 2: AWS EC2 t2.micro
- Free tier eligible (750 hours/month)
- More configuration control

#### Option 3: ECS Fargate
- Free tier: 20 GB-hours per month
- Containerized deployment

**Deployment Steps:**
1. Create AWS account and set up billing alerts ($5 budget)
2. Provision instance (Lightsail/EC2/ECS)
3. Install Node.js 18+ on instance
4. Clone repository
5. Set up environment variables (use `.env.staging`)
6. Run migrations against Neon database
7. Build and start server
8. Configure security group to allow port 4000 (or proxy through nginx)

### Frontend Deployment

Build static frontend:

```bash
npm run build
```

Deploy `dist/` folder to:
- AWS S3 + CloudFront
- Vercel
- Netlify
- GitHub Pages

Update backend CORS to allow your frontend domain.

## Database Schema

See [`server/prisma/schema.prisma`](./server/prisma/schema.prisma) for the complete schema.

**Models:**
- `User` - Authentication and ownership
- `Project` - Main project entity
- `Note` - Project notes
- `Doc` - Document metadata
- `Connection` - API keys/configs
- `Cost` - Expense tracking
- `Task` - Hierarchical tasks
- `TimeLog` - Time tracking
- `RBAC` - Project permissions

## Development Workflow

1. **Start Backend:**
   ```bash
   cd server && ./start.sh
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Make Changes:**
   - Frontend: Hot-reload enabled
   - Backend: Rebuild with `npm run build` in `server/`

4. **Test API:**
   ```bash
   cd server && ./test-api.sh
   ```

## Next Steps

- [ ] Wire frontend to backend APIs
- [ ] Add JWT middleware for protected routes
- [ ] Implement RBAC checks on endpoints
- [ ] Add request validation (Zod)
- [ ] Add file upload for docs
- [ ] Deploy to AWS staging environment
- [ ] Add comprehensive error handling
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline

## Troubleshooting

### Backend won't start
```bash
# Check if port 4000 is in use
lsof -ti:4000 | xargs kill -9

# Regenerate Prisma client
cd server && npx prisma generate
```

### Frontend build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database issues
```bash
# Reset database (WARNING: deletes all data)
cd server
npx prisma migrate reset
npx tsx prisma/seed.ts
```

## Documentation

- [Backend API Documentation](./server/README.md)

## License

Private - Clarity AI Project Evaluation

---

**Contact:** jdeegan@gainclarity.com
