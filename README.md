# Project Insight Hub

A full-stack project management platform with role-based access control, time tracking, task management, and cost monitoring.

## 🚀 Live Demo

**Frontend**: [Deploy to see live URL]  
**Backend API**: [Deploy to see live URL]

## 📋 Project Overview

Project Insight Hub is a comprehensive project management tool built with modern web technologies. It features user authentication, RBAC (Role-Based Access Control), project tracking, task management, time logging, and cost monitoring.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/07570a4d-6c7b-4d8c-8e1a-6e701ca20c38) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🛠️ Tech Stack

### Frontend
- **React** + **TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **ShadCN UI** - Component library
- **Tailwind CSS** - Styling
- **TanStack Query** - Data fetching and caching
- **React Router** - Navigation

### Backend
- **Fastify** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **TypeScript** - Type safety
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Features
- ✅ User authentication & authorization
- ✅ Role-based access control (Admin, Editor, Viewer)
- ✅ Project management
- ✅ Task tracking with parent/child relationships
- ✅ Time logging
- ✅ Cost monitoring
- ✅ Documentation management
- ✅ Audit logging
- ✅ Notes and connections tracking

## 🔐 Authentication & User Roles

The application includes role-based access control (RBAC) with three user roles:

### 👑 **Admin Users**
- **Full access** to all features
- Can create, edit, and delete projects
- Can manage user roles and permissions
- Can view audit logs

### ✏️ **Editor Users**
- Can create and edit project content
- Can log time and manage tasks
- Cannot delete projects or manage users

### 👁️ **Viewer Users** (Guest Access)
- **Read-only access** to projects
- Can view all project information
- Cannot make any changes

### 🎯 **Demo Accounts**

For demonstration purposes, the following accounts are available:

#### **Admin Account**
- **Email**: `admin@projecthub.com`
- **Password**: `AdminPass123!`
- **Role**: Admin (full access)

#### **Guest Viewer Account**
- **Email**: `guest@projecthub.com`
- **Password**: One-click login (no password required)
- **Role**: Viewer (read-only)

#### **Sample Account** (Legacy)
- **Email**: `jdeegan@gainclarity.com`
- **Password**: `password`
- **Role**: Admin

### 🚀 **Getting Started with Authentication**

1. **Run the database migrations and seed:**
   ```bash
   cd server
   npm run prisma:migrate
   npm run prisma:seed
   ```

2. **Start the development servers** (see Local Development section below)

3. **Choose your login method:**
   - **Guest**: Click "Login as Guest" for instant read-only access
   - **Admin**: Click "Login as Admin" then enter password
   - **Sample**: Click "Login as Sample User" then enter password

### 🔧 **Creating Additional Admin Users**

To create additional admin users programmatically:

```bash
curl -X POST http://localhost:4000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"your-admin@example.com","password":"SecurePass123!","name":"Your Name"}'
```

## 🚀 Deployment

This project is production-ready and can be deployed to the cloud.

**See the complete deployment guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deploy Options

- **Frontend**: Deploy to [Vercel](https://vercel.com) (recommended)
- **Backend**: Deploy to [Railway](https://railway.app) or [Render](https://render.com)
- **Database**: Use Railway Postgres, Render Postgres, or [Neon](https://neon.tech)

### Environment Variables

Frontend (`.env`):
```
VITE_API_URL=https://your-backend-url.com/api
```

Backend (`server/.env`):
```
DATABASE_URL=postgresql://user:pass@host:5432/db
FRONTEND_URL=https://your-frontend-url.com
PORT=4000
JWT_SECRET=your-secret-key
```

## 🏗️ Local Development

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database

### Setup

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd Project-Insight-Hub
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Set up environment files**
   ```bash
   # Frontend root
   cp .env.example .env
   
   # Backend
   cp server/.env.example server/.env
   ```

5. **Configure your database**
   - Update `server/.env` with your PostgreSQL connection string

6. **Run database migrations**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   ```

7. **Start the backend**
   ```bash
   cd server
   npm run dev
   ```

8. **Start the frontend** (in a new terminal)
   ```bash
   npm run dev
   ```

9. **Access the app**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:4000

## 📚 API Documentation

The backend exposes a REST API with the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `POST /api/tasks` - Create task
- `POST /api/timelogs` - Log time
- `GET /api/rbac` - Get role assignments
- `GET /api/auditlogs` - Get audit logs

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

John Scarrow - [GitHub Profile](https://github.com/JohnScarrow)
