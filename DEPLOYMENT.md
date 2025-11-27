# Project Insight Hub - Deployment Guide

This guide covers deploying **Project Insight Hub** to the cloud for your portfolio.

## 🏗️ Architecture Overview

- **Frontend**: React + Vite + ShadCN UI → Deploy to **Vercel**
- **Backend**: Fastify + Prisma → Deploy to **Railway** or **Render**
- **Database**: PostgreSQL → Managed by Railway/Render or use **Neon**

---

## 📦 Prerequisites

1. GitHub account (to push your code)
2. Accounts on deployment platforms:
   - [Vercel](https://vercel.com) (frontend)
   - [Railway](https://railway.app) or [Render](https://render.com) (backend)
   - Optional: [Neon](https://neon.tech) for serverless Postgres

---

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "chore: add deployment configs"
   git push origin main
   ```

2. **Set up environment files** (don't commit real values!):
   - Copy `.env.example` to `.env` (frontend root)
   - Copy `server/.env.example` to `server/.env`

---

### Step 2: Deploy the Database

#### Option A: Railway (Recommended - Easy Setup)

1. Go to [Railway](https://railway.app)
2. Click **"New Project"** → **"Provision PostgreSQL"**
3. Once created, click on the Postgres service
4. Go to **"Connect"** tab and copy the `DATABASE_URL`
5. Save this URL — you'll need it for the backend deployment

#### Option B: Neon (Serverless Postgres)

1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (looks like `postgresql://user:pass@host/db?sslmode=require`)
4. Save this URL for backend deployment

---

### Step 3: Deploy the Backend API

#### Option A: Railway

1. Go to [Railway](https://railway.app) → **"New Project"** → **"Deploy from GitHub repo"**
2. Select your `Project-Insight-Hub` repository
3. Railway will detect the Node.js app — click **"Add variables"**
4. Set these environment variables:
   ```
   DATABASE_URL=<your-postgres-url-from-step-2>
   FRONTEND_URL=https://your-frontend-url.vercel.app
   PORT=4000
   JWT_SECRET=<generate-a-random-secure-string>
   NODE_ENV=production
   ```
5. Under **Settings** → **Root Directory**, set to: `server`
6. Under **Settings** → **Build Command**, set:
   ```
   npm install && npx prisma generate && npm run build
   ```
7. Under **Settings** → **Start Command**, set:
   ```
   npx prisma migrate deploy && npm start
   ```
8. Click **"Deploy"** — Railway will build and start your API
9. Once deployed, copy the **public URL** (e.g., `https://your-app.railway.app`)

#### Option B: Render

1. Go to [Render](https://render.com) → **"New"** → **"Web Service"**
2. Connect your GitHub and select `Project-Insight-Hub`
3. Configure:
   - **Name**: `project-insight-hub-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`
4. Set environment variables:
   ```
   DATABASE_URL=<your-postgres-url>
   FRONTEND_URL=https://your-frontend.vercel.app
   PORT=4000
   JWT_SECRET=<generate-random-string>
   NODE_ENV=production
   ```
5. Click **"Create Web Service"**
6. Copy the deployed URL (e.g., `https://your-app.onrender.com`)

---

### Step 4: Deploy the Frontend

1. Go to [Vercel](https://vercel.com) → **"Add New"** → **"Project"**
2. Import your `Project-Insight-Hub` repository
3. Vercel auto-detects Vite — configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
   (Use the backend URL from Step 3)
5. Click **"Deploy"**
6. Once deployed, copy your frontend URL (e.g., `https://project-insight-hub.vercel.app`)

---

### Step 5: Update CORS Settings

1. Go back to your **backend deployment** (Railway/Render)
2. Update the `FRONTEND_URL` environment variable to your **actual Vercel URL**:
   ```
   FRONTEND_URL=https://project-insight-hub.vercel.app
   ```
3. Redeploy the backend (Railway/Render will auto-redeploy on env change)

---

### Step 6: Seed Initial Data (Optional)

If you want to create a demo user or initial data:

1. Install Railway CLI or use Render shell
2. Run the seed script:
   ```bash
   npx prisma db seed
   ```

Or manually create a user via API after deployment.

---

## 🔐 Security Checklist

- ✅ Generate a strong `JWT_SECRET` (use `openssl rand -base64 32`)
- ✅ Never commit `.env` files
- ✅ Use production database (not dev/test data)
- ✅ Enable HTTPS (Vercel/Railway/Render provide this by default)
- ✅ Review CORS settings to only allow your frontend domain

---

## 📊 Monitor Your Deployment

- **Vercel Dashboard**: Monitor frontend builds, analytics, logs
- **Railway/Render Dashboard**: Monitor API logs, health, usage
- **Database**: Monitor connections and query performance

---

## 🛠️ Useful Commands

### Local Development
```bash
# Frontend
npm run dev

# Backend
cd server
npm run dev
```

### Production Checks
```bash
# Test production build locally
npm run build
npm run preview

# Check backend build
cd server
npm run build
npm start
```

---

## 🎨 Portfolio Presentation Tips

1. **Add a README badge** showing deployment status
2. **Screenshot the live app** for your portfolio
3. **Document key features** in your portfolio case study:
   - Full-stack TypeScript
   - Role-based access control (RBAC)
   - Prisma ORM with PostgreSQL
   - React + ShadCN UI components
   - RESTful API with Fastify
4. **Highlight tech stack**:
   - Frontend: React, TypeScript, Vite, TailwindCSS, ShadCN
   - Backend: Fastify, Prisma, PostgreSQL
   - Deployment: Vercel + Railway/Render

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_URL` is set correctly in Vercel
- Verify backend URL is accessible (open in browser)
- Check CORS settings in backend

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check database is running (Railway/Neon dashboard)
- Ensure migrations ran (`npx prisma migrate deploy`)

### Build failures
- Check Node version compatibility (use Node 18+)
- Clear caches and rebuild
- Check build logs for specific errors

---

## 📝 Next Steps

1. Set up custom domain (optional)
2. Add monitoring/analytics (Vercel Analytics, Sentry)
3. Set up CI/CD with GitHub Actions
4. Add rate limiting and security headers

---

**Live URLs** (update after deployment):
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-api.railway.app`
- Docs: Add link to your portfolio

---

**Questions?** Check the deployment platform docs:
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
