# Quick Reference - Project Insight Hub

## 🚀 Start Everything

```bash
# Terminal 1 - Backend
cd server
./start.sh

# Terminal 2 - Frontend  
npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

**Admin Login:**
- Email: `jdeegan@gainclarity.com`
- Password: `password`

## 📁 Key Files

```
project-insight-hub/
├── PROJECT_README.md           ← Main project docs
├── IMPLEMENTATION_SUMMARY.md   ← What's done
├── server/
│   ├── README.md              ← Backend API docs
│   ├── start.sh               ← Quick start backend
│   ├── test-api.sh            ← Test all endpoints
│   ├── .env                   ← Config (create from .env.example)
│   └── prisma/
│       ├── schema.prisma      ← Database schema
│       └── seed.ts            ← Seed data
└── src/
    └── pages/                 ← Frontend pages (wire to API)
```

## 🔌 API Quick Test

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jdeegan@gainclarity.com","password":"password"}'

# Get projects
curl http://localhost:4000/api/projects

# Run all tests
cd server && ./test-api.sh
```

## ✅ Completed (Backend)

- ✅ Fastify + TypeScript server
- ✅ Prisma + SQLite database
- ✅ All CRUD endpoints (8 resources)
- ✅ Authentication (login/signup)
- ✅ Database schema with relations
- ✅ Seed data
- ✅ Documentation
- ✅ Test scripts

## 🔄 Next Steps

1. **Wire Frontend to Backend**
   - Update `src/pages/Projects.tsx` to fetch from API
   - Add forms for Create/Edit/Delete
   - Connect all other pages

2. **Environment Setup**
   - Create Neon PostgreSQL database
   - Add `.env.local` and `.env.staging`
   - Switch to Neon for staging

3. **Deploy**
   - AWS account + billing alerts
   - Deploy backend to Lightsail/EC2
   - Deploy frontend to S3/Vercel/Netlify

4. **Final Deliverable**
   - Record 3-minute video
   - Explain what you built
   - Share learnings

## 📚 Resources

- Backend API Docs: `server/README.md`
- Project Overview: `PROJECT_README.md`
- Implementation Details: `IMPLEMENTATION_SUMMARY.md`

## 🆘 Troubleshooting

```bash
# Backend won't start
lsof -ti:4000 | xargs kill -9
cd server && npx prisma generate

# Database issues
cd server && npx prisma migrate reset

# Frontend errors
rm -rf node_modules && npm install
```

## 📊 API Endpoints Summary

All prefixed with `/api`:

**Auth:** `/auth/login`, `/auth/signup`, `/auth/me`

**CRUD Resources:**
- `/projects` - Project management
- `/notes` - Project notes
- `/docs` - Documents
- `/connections` - API keys
- `/costs` - Expenses
- `/tasks` - Hierarchical tasks
- `/timelogs` - Time tracking

Each supports: `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`

Query filters: `?projectId=xxx`, `?userId=xxx`, `?taskId=xxx`

---

**Status:** Backend complete ✅ | Frontend wiring needed 🔄 | Deployment pending ⏳
