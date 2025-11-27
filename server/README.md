# Project Insight Hub - Backend API

A Fastify + TypeScript + Prisma backend for the Project Insight Hub tracking application.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify 4
- **ORM**: Prisma (SQLite for local dev, PostgreSQL for staging/production)
- **Language**: TypeScript
- **Auth**: bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm

### Installation

```bash
cd server
npm install
```

### Database Setup

The project uses SQLite for local development. To initialize the database:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database with admin user
npx tsx prisma/seed.ts
```

**Seeded User:**
- Email: `jdeegan@gainclarity.com`
- Password: `password`

### Running the Server

#### Development Mode (with auto-reload)

```bash
npm run dev
```

#### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

#### Quick Start (compiled)

```bash
# Build and run
npx tsc -p tsconfig.build.json
node --experimental-specifier-resolution=node dist/index.js
```

The server will start on **http://localhost:4000** (or the port specified in `.env`).

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email and password
  ```json
  {
    "email": "jdeegan@gainclarity.com",
    "password": "password"
  }
  ```

- `POST /api/auth/signup` - Create a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password",
    "name": "User Name"
  }
  ```

- `GET /api/auth/me` - Get current user info

### Projects

- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a project
- `GET /api/projects/:id` - Get a single project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

**Example Create:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "ownerId": "user_id"
}
```

### Notes

- `GET /api/notes?projectId=xxx` - List notes (filter by projectId)
- `POST /api/notes` - Create a note
- `GET /api/notes/:id` - Get a single note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

**Example Create:**
```json
{
  "projectId": "project_id",
  "content": "Note content here"
}
```

### Docs

- `GET /api/docs?projectId=xxx` - List docs
- `POST /api/docs` - Create a doc
- `GET /api/docs/:id` - Get a single doc
- `PUT /api/docs/:id` - Update a doc
- `DELETE /api/docs/:id` - Delete a doc

**Example Create:**
```json
{
  "projectId": "project_id",
  "title": "Document Title",
  "url": "https://example.com/doc.pdf"
}
```

### Connections

- `GET /api/connections?projectId=xxx` - List connections
- `POST /api/connections` - Create a connection
- `GET /api/connections/:id` - Get a single connection
- `PUT /api/connections/:id` - Update a connection
- `DELETE /api/connections/:id` - Delete a connection

**Example Create:**
```json
{
  "projectId": "project_id",
  "name": "Twilio API",
  "type": "api_key",
  "config": "encrypted_config_data"
}
```

### Costs

- `GET /api/costs?projectId=xxx` - List costs
- `POST /api/costs` - Create a cost
- `GET /api/costs/:id` - Get a single cost
- `PUT /api/costs/:id` - Update a cost
- `DELETE /api/costs/:id` - Delete a cost

**Example Create:**
```json
{
  "projectId": "project_id",
  "service": "AWS",
  "amount": 125.50,
  "period": "monthly"
}
```

### Tasks

- `GET /api/tasks?projectId=xxx` - List tasks (with parent/child relations)
- `POST /api/tasks` - Create a task
- `GET /api/tasks/:id` - Get a single task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

**Example Create (Parent Task):**
```json
{
  "projectId": "project_id",
  "title": "Parent Task",
  "completed": false
}
```

**Example Create (Child Task):**
```json
{
  "projectId": "project_id",
  "parentId": "parent_task_id",
  "title": "Child Task",
  "completed": false
}
```

### Time Logs

- `GET /api/timelogs?projectId=xxx&userId=xxx&taskId=xxx` - List time logs
- `POST /api/timelogs` - Create a time log
- `GET /api/timelogs/:id` - Get a single time log
- `PUT /api/timelogs/:id` - Update a time log
- `DELETE /api/timelogs/:id` - Delete a time log

**Example Create:**
```json
{
  "userId": "user_id",
  "projectId": "project_id",
  "taskId": "task_id",
  "duration": 3600,
  "notes": "Worked on implementing API"
}
```

## Environment Variables

Create a `.env` file in the `server/` directory:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="change-this-to-a-strong-secret"
PORT=4000
FRONTEND_URL=http://localhost:5173
```

For staging/production with Neon PostgreSQL:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
JWT_SECRET="strong-random-secret"
PORT=4000
FRONTEND_URL=https://your-frontend-domain.com
```

## Database Schema

The database includes the following models:

- **User** - Users with authentication
- **Project** - Projects owned by users
- **Note** - Notes attached to projects
- **Doc** - Document metadata attached to projects
- **Connection** - API keys and connection configs
- **Cost** - Cost tracking for services
- **Task** - Tasks with parent/child relationships
- **TimeLog** - Time tracking entries
- **RBAC** - Role-based access control (project-level permissions)

## Prisma Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (DB GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Testing Endpoints

Use `curl` to test endpoints:

```bash
# Test login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jdeegan@gainclarity.com","password":"password"}'

# Create a project
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","description":"A test","ownerId":"user_id"}'

# Get all projects
curl http://localhost:4000/api/projects
```

## Deployment Notes

### Switching to Neon PostgreSQL

1. Create a Neon account and database
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Update `.env` with Neon connection string
4. Run migrations: `npx prisma migrate deploy`
5. Seed the database

### AWS Deployment

See main project README for deployment instructions to AWS Lightsail/EC2.

## Project Structure

```
server/
├── src/
│   ├── index.ts           # Main server entry point
│   ├── plugins/
│   │   └── prisma.ts      # Prisma plugin for Fastify
│   └── routes/
│       ├── auth.ts        # Authentication routes
│       ├── projects.ts    # Project CRUD
│       ├── notes.ts       # Note CRUD
│       ├── docs.ts        # Doc CRUD
│       ├── connections.ts # Connection CRUD
│       ├── costs.ts       # Cost CRUD
│       ├── tasks.ts       # Task CRUD (with parent/child)
│       └── timelogs.ts    # TimeLog CRUD
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Database seeding script
│   └── dev.db             # SQLite database (local dev)
├── dist/                  # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json
└── .env                   # Environment variables (DO NOT COMMIT)
```

## Troubleshooting

### ESM Import Issues

If you see "Must use import to load ES Module" errors, use:

```bash
node --experimental-specifier-resolution=node dist/index.js
```

### Prisma Client Not Generated

Run:

```bash
npx prisma generate
```

### Port Already in Use

Change the `PORT` in `.env` or kill the existing process:

```bash
lsof -ti:4000 | xargs kill -9
```

## Next Steps

- [ ] Add JWT authentication middleware to protect routes
- [ ] Implement proper RBAC checks on project endpoints
- [ ] Add request validation using Zod
- [ ] Add comprehensive error handling
- [ ] Add API rate limiting
- [ ] Add logging (Winston or Pino)
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add unit and integration tests
