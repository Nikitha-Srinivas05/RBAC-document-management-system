# 📄 RBAC Document Management System

A document management system with role-based access control and a complete audit trail.

---

## ✨ Features

- 🔐 JWT-based authentication (register/login)
- 👥 Role-based access control — **Owner**, **Editor**, **Viewer**
- 📝 Document versioning — every edit creates a new version, nothing is overwritten
- 🔑 Owners can grant/revoke access to other users per document
- 🕵️ Full audit trail — every view, edit, delete, and permission change is logged
- 🐳 One-command setup with Docker Compose

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT
**Frontend:** React
**Deployment:** Docker, Docker Compose

---

## 📂 Folder Structure

```
rbac-doc-system/
├── backend/
│   ├── config/       # DB connection, role seeding
│   ├── middleware/    # auth + permission checks
│   ├── models/         # User, Document, DocumentVersion, Role, Permission, AuditLog
│   ├── routes/          # API endpoints
│   └── server.js
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       └── api/
└── docker-compose.yml
```

---

## 🚀 Getting Started

1. Clone the repo
   ```bash
   git clone <your-repo-url>
   cd rbac-doc-system
   ```

2. Set up environment variables
   ```bash
   cp backend/.env.example backend/.env
   ```
   Then open `backend/.env` and set your own `JWT_SECRET`.

3. Run with Docker
   ```bash
   docker compose up --build
   ```

4. Backend will be running at `http://localhost:5000`
   Check it's alive: `GET /health`

5. Run the frontend (in a separate terminal)
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
   Frontend runs at `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Log in and get a JWT |

More endpoints (documents, permissions, audit logs) are being added as the project progresses.
