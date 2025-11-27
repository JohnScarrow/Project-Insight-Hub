# Neon Database Setup Guide

## Quick Overview

This guide walks you through setting up a Neon PostgreSQL database for Project Insight Hub.

**Time Required:** ~10 minutes  
**Cost:** $0 (Free tier)

---

## Step 1: Create Neon Account

1. Go to **[neon.tech](https://neon.tech)**
2. Click **"Sign Up"** (use GitHub for fastest setup)
3. Verify your email

---

## Step 2: Create Your Project

1. Click **"New Project"** on the dashboard
2. **Project Settings:**
   - **Name:** `project-insight-hub`
   - **Region:** Choose closest to you
     - For AWS US deployment: `US East (Ohio)` or `US East (N. Virginia)`
   - **PostgreSQL Version:** 15 or 16 (default is fine)
   - **Compute Size:** Shared (free tier)
3. Click **"Create Project"**

---

## Step 3: Understand Branches

Neon creates a **main** branch by default. Think of branches like Git branches but for your database.

**For this project, you need:**
- `main` branch (default) → Use for staging/production
- `dev` branch → Use for local development (optional but recommended)

**To create a dev branch:**
1. In your project, click **"Branches"** in the left sidebar
2. Click **"New Branch"**
3. **Name:** `dev`
4. **Parent Branch:** `main`
5. Click **"Create Branch"**

---

## Step 4: Get Connection String

### For Local Development:

1. Select your **dev** branch (or **main** if you didn't create dev)
2. Click **"Connection Details"**
3. **Connection String** section will show something like:
   ```
   postgresql://username:password@ep-cool-name-12345678.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Click **"Copy"** button

### For Staging/Production:

1. Select your **main** branch
2. Copy that connection string too (save for later)

---

## Step 5: Configure Local Environment

1. **Open** `server/.env.local` in your editor
2. **Replace** the `DATABASE_URL` line with your connection string:
   ```env
   DATABASE_URL="postgresql://your-actual-connection-string-here"
   ```
3. **Copy** `.env.local` to `.env`:
   ```bash
   cd server
   cp .env.local .env
   ```

**Your `server/.env` should now look like:**
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="local-dev-secret-change-in-production"
PORT=4000
FRONTEND_URL=http://localhost:5173
```

---

## Step 6: Update Prisma Schema for PostgreSQL

The current schema uses SQLite. Update it to PostgreSQL:

```bash
cd server
```

Open `prisma/schema.prisma` and change:

**FROM:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**TO:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Step 7: Run Migrations to Neon

Now push your database schema to Neon:

```bash
cd server

# Generate Prisma client for PostgreSQL
npx prisma generate

# Create tables in Neon
npx prisma migrate dev --name init

# Seed the database with admin user
npx tsx prisma/seed.ts
```

**Expected output:**
```
✔ Generated Prisma Client
✔ The migration has been applied successfully
✔ Seeded database
```

---

## Step 8: Verify in Neon Console

1. Go back to **Neon dashboard**
2. Click **"Tables"** in left sidebar (or SQL Editor)
3. You should see all your tables:
   - User
   - Project
   - Note
   - Doc
   - Connection
   - Cost
   - Task
   - TimeLog
   - RBAC

---

## Step 9: Test Connection

Start your server and test:

```bash
cd server

# Build and start server
npx tsc -p tsconfig.build.json
node --experimental-specifier-resolution=node dist/index.js
```

In another terminal, test the API:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jdeegan@gainclarity.com","password":"password"}'
```

**Expected:** JSON response with user data (no password)

---

## Step 10: Configure Staging Environment

When you're ready to deploy:

1. **Open** `server/.env.staging`
2. **Replace** `DATABASE_URL` with your **main** branch connection string
3. **Generate strong JWT secret:**
   ```bash
   openssl rand -base64 32
   ```
4. **Replace** `JWT_SECRET` with the generated secret
5. **Update** `FRONTEND_URL` with your deployed frontend URL

**DO NOT commit `.env.staging`** - you'll manually copy it to your server during deployment.

---

## Troubleshooting

### "Authentication failed" error
- Double-check your connection string is correct
- Make sure you copied the entire string including `?sslmode=require`
- Verify your Neon project is active (not paused)

### "Can't reach database" error
- Check your internet connection
- Verify the Neon service is up: [status.neon.tech](https://status.neon.tech)
- Try using the IP allowlist feature in Neon if you have firewall issues

### Migration errors
- Make sure `DATABASE_URL` is set correctly in `.env`
- Delete `prisma/migrations` folder and try again
- Use `npx prisma migrate reset` to start fresh (WARNING: deletes data)

### Schema already exists
If you've run migrations before with SQLite, you might see conflicts:
```bash
cd server
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

---

## Quick Reference

**Neon Dashboard:** https://console.neon.tech  
**Docs:** https://neon.tech/docs/introduction  
**Connection String Format:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

---

## Security Checklist

- [ ] `.env`, `.env.local`, `.env.staging` are in `.gitignore`
- [ ] Never committed connection strings to git
- [ ] Generated strong JWT secret for staging (32+ chars)
- [ ] Different DATABASE_URL for dev and staging
- [ ] Neon project has access restricted (optional: IP allowlist)

---

## Next Steps

Once Neon is set up:
1. ✅ Update `server/.env` with Neon connection string
2. ✅ Change `prisma/schema.prisma` to use `postgresql`
3. ✅ Run migrations: `npx prisma migrate dev`
4. ✅ Seed database: `npx tsx prisma/seed.ts`
5. ✅ Test API endpoints
6. → Move to frontend integration
7. → Deploy to AWS with staging connection string

---

**Status:** Environment files created ✅ | Waiting for your Neon connection string 🔄
