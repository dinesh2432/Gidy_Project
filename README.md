# 🔐 SecureLog — Security Audit Log Dashboard

> An enterprise-grade, production-ready security audit log system for Security Engineers to **upload, store, investigate, and analyze** audit events at scale.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Data Format](#data-format)
- [Project Structure](#project-structure)
- [MongoDB Indexes](#mongodb-indexes)
- [Deployment](#deployment)
- [Technical Decisions](#technical-decisions)
- [Future Improvements](#future-improvements)

---

## 🔍 Overview

**SecureLog** is a full-stack MERN application that provides Security Engineers with a centralized platform to:

- **Bulk upload** up to 10,000 audit log records in a single request
- **Investigate** logs with advanced multi-dimensional filtering
- **Search** across actors, actions, resources, IPs, and regions in real-time
- **Analyze** security events through a statistics dashboard
- **Export** filtered data to JSON for further investigation

The system is designed for high-throughput log ingestion and zero-compromise performance — all filtering, sorting, and pagination happens on the backend, ensuring the frontend never loads more data than the current page requires.

---

## ✨ Features

### Core
- ✅ **Bulk Upload API** — accepts 10,000 log records in one request with per-record validation
- ✅ **Duplicate Handling** — gracefully skips duplicate records, reports exact counts
- ✅ **Server-Side Processing** — all filtering, sorting, searching, and pagination on the backend
- ✅ **Full-Text Search** — MongoDB text index across 8 fields, case-insensitive
- ✅ **Advanced Filters** — role, action, resourceType, severity, status, region, date range
- ✅ **Multi-Column Sorting** — timestamp, severity, actor, action, region (asc/desc)
- ✅ **Paginated API** — page number, page size, total pages, total docs
- ✅ **Aggregated Statistics** — total, critical, high, medium, low, resolved, unresolved, today's uploads

### Frontend Dashboard
- ✅ **Dark Professional UI** — GitHub-inspired dark design system
- ✅ **8 Statistics Cards** — with severity and status breakdowns
- ✅ **Debounced Search** — fires 400ms after the user stops typing
- ✅ **7-Filter Panel** — with active indicator and one-click reset
- ✅ **Data Table** — sticky header, sortable columns, row hover, click-to-detail
- ✅ **Log Detail Drawer** — full log view with Copy JSON button
- ✅ **Upload Modal** — drag-and-drop file + raw JSON paste with upload statistics
- ✅ **Export to JSON** — download current page as `.json`
- ✅ **Loading Skeletons** — skeleton loaders on statistics cards
- ✅ **Error State** — alert with retry button
- ✅ **Empty State** — Ant Design empty illustration
- ✅ **Collapsible Sidebar** — smooth 220px ↔ 64px transition

### Bonus
- ✅ Debounced Search
- ✅ Date Picker Filter (Range)
- ✅ Refresh Button
- ✅ Reset Filters
- ✅ Copy Log JSON
- ✅ View Log Details Drawer
- ✅ Export/Download Current Page

---

## 🛠 Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool and dev server |
| Ant Design | 5.x | Component library |
| Axios | latest | HTTP client |
| React Router DOM | 7 | Client-side routing |
| dayjs | latest | Date formatting (UTC) |

### Backend
| Package | Version | Purpose |
|---|---|---|
| Node.js | ≥18 | Runtime |
| Express | 5 | HTTP framework |
| MongoDB Atlas | — | Database |
| Mongoose | 8 | ODM |
| mongoose-paginate-v2 | latest | Server-side pagination |
| mongoose-aggregate-paginate-v2 | latest | Aggregation pagination |
| express-validator | 7 | Request validation |
| helmet | 8 | HTTP security headers |
| compression | latest | gzip response compression |
| morgan | latest | HTTP request logging |
| cors | latest | Cross-origin resource sharing |
| multer | latest | File upload parsing |
| uuid | latest | Batch ID generation for dedup |
| dotenv | 16 | Environment variable loading |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                      │
│  (Vite · Ant Design · Axios · React Router · dayjs)  │
│                    ↕ HTTP/JSON                        │
├─────────────────────────────────────────────────────┤
│                 Express.js Backend                    │
│   Routes → Validators → Controllers → Services       │
│                    ↕ Mongoose ODM                     │
├─────────────────────────────────────────────────────┤
│                  MongoDB Atlas                        │
│         Indexes · Text Search · Aggregation          │
└─────────────────────────────────────────────────────┘
```

**Data Flow:**
1. Frontend sends paginated requests with filter/sort params
2. Backend validates query params via express-validator
3. Service layer builds the MongoDB filter + sort objects
4. Mongoose paginates with `lean()` for maximum performance
5. Response is formatted uniformly as `{ success, message, data, meta }`

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0
- MongoDB Atlas account (free tier works)

### Clone the Repository
```bash
git clone https://github.com/your-username/security-audit-log-dashboard.git
cd security-audit-log-dashboard
```

### Install All Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

Or from the root:
```bash
npm run install:all
```

---

## ⚙ Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/security_audit_logs?retryWrites=true&w=majority
NODE_ENV=development
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `MONGO_URI` | **Yes** | MongoDB Atlas connection string |
| `NODE_ENV` | No | `development` or `production` |

### Frontend — `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | Backend API base URL |

> **Production:** Set `VITE_API_BASE_URL=https://your-backend.onrender.com/api` in Vercel environment settings.

---

## 🏃 Running the Application

### Backend

```bash
cd backend

# Development (with hot reload)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:5000`
Health check: `http://localhost:5000/health`

### Frontend

```bash
cd frontend

# Development
npm run dev

# Production build
npm run build
```

Frontend dev server at `http://localhost:3000`

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### `POST /api/logs/upload`
Bulk upload audit log records.

**Request Body:** JSON array (1–10,000 records)
```json
[
  {
    "actor": "priya.nair@company.com",
    "role": "admin",
    "action": "DELETE_USER",
    "resource": "/api/users/334",
    "resourceType": "USER",
    "ipAddress": "192.168.1.45",
    "region": "ap-south-1",
    "severity": "HIGH",
    "status": "Unresolved",
    "timestamp": "2025-06-14T08:32:11Z"
  }
]
```

**Response:**
```json
{
  "success": true,
  "message": "Upload complete. 9987 logs inserted successfully.",
  "data": {
    "totalReceived": 10000,
    "inserted": 9987,
    "duplicates": 13,
    "failed": 0,
    "validationErrors": [],
    "processingTime": "1.52s"
  }
}
```

---

#### `GET /api/logs`
Fetch paginated, filtered logs.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Records per page (default: 25, max: 100) |
| `search` | string | Full-text search |
| `role` | enum | Filter by role |
| `action` | enum | Filter by action |
| `resourceType` | enum | Filter by resource type |
| `severity` | enum | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `status` | enum | `Resolved`, `Unresolved` |
| `region` | enum | AWS region code |
| `startDate` | ISO 8601 | Date range start |
| `endDate` | ISO 8601 | Date range end |
| `sortBy` | string | `timestamp`, `severity`, `actor`, `action`, `region` |
| `sortOrder` | string | `asc`, `desc` (default: `desc`) |

**Response:**
```json
{
  "success": true,
  "message": "Logs retrieved successfully",
  "data": [...],
  "meta": {
    "pagination": {
      "currentPage": 1,
      "totalPages": 400,
      "totalDocs": 9987,
      "limit": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

#### `GET /api/logs/stats`
Aggregated dashboard statistics.

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 9987,
    "critical": 543,
    "high": 2187,
    "medium": 4103,
    "low": 3154,
    "resolved": 6891,
    "unresolved": 3096,
    "todayUploads": 312
  }
}
```

---

#### `GET /api/logs/:id`
Fetch a single log record by MongoDB ObjectId.

**Response:**
```json
{
  "success": true,
  "message": "Log retrieved successfully",
  "data": { ...logObject }
}
```

---

### Error Response Format

All errors follow the same structure:
```json
{
  "success": false,
  "message": "Descriptive error message",
  "data": { "errors": [...] }
}
```

| Status | Meaning |
|---|---|
| 400 | Bad request / invalid format |
| 404 | Resource not found |
| 409 | Conflict (duplicate key) |
| 422 | Validation failed |
| 500 | Internal server error |

---

## 📊 Data Format

Each log record must contain:

| Field | Type | Validation |
|---|---|---|
| `actor` | string | Valid email address |
| `role` | enum | `admin`, `developer`, `analyst`, `viewer`, `auditor`, `operator` |
| `action` | enum | One of 30 defined action types |
| `resource` | string | API path or resource identifier |
| `resourceType` | enum | `USER`, `ROLE`, `FILE`, `DATABASE`, `API`, `SYSTEM`, etc. |
| `ipAddress` | string | Valid IPv4 or IPv6 |
| `region` | enum | AWS region code (e.g., `ap-south-1`) |
| `severity` | enum | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `status` | enum | `Resolved`, `Unresolved` |
| `timestamp` | ISO 8601 | Valid UTC datetime |

---

## 📁 Project Structure

```
security-audit-log-dashboard/
├── .gitignore
├── package.json              ← Root monorepo scripts
├── render.yaml               ← Render deployment config
│
├── backend/
│   ├── server.js             ← Entry point, graceful shutdown
│   ├── app.js                ← Express app, middleware wiring
│   ├── .env / .env.example
│   ├── config/
│   │   └── config.js         ← Centralized env config
│   ├── constants/
│   │   └── logConstants.js   ← Enums, defaults, valid values
│   ├── database/
│   │   └── connection.js     ← MongoDB connection + reconnect
│   ├── models/
│   │   └── Log.js            ← Mongoose schema + all indexes
│   ├── validators/
│   │   └── logValidators.js  ← express-validator chains
│   ├── services/
│   │   └── logService.js     ← Business + DB logic
│   ├── controllers/
│   │   └── logController.js  ← HTTP handlers
│   ├── routes/
│   │   └── logRoutes.js      ← Express router
│   ├── middlewares/
│   │   ├── errorHandler.js   ← Global error handler
│   │   ├── notFoundHandler.js← 404 handler
│   │   └── validate.js       ← Validation middleware
│   └── utils/
│       └── helpers.js        ← asyncHandler, createResponse, filters
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── vercel.json           ← Vercel deployment config
    ├── .env / .env.example
    └── src/
        ├── main.jsx          ← React entry + AntD ConfigProvider
        ├── App.jsx           ← Router setup
        ├── index.css         ← Global dark design system
        ├── constants/
        │   └── index.js      ← Colors, enums, defaults
        ├── services/
        │   └── logService.js ← Axios API client
        ├── hooks/
        │   ├── useLogs.js    ← Log state management
        │   └── useStats.js   ← Stats fetching
        ├── utils/
        │   └── formatters.js ← dayjs formatters, clipboard
        ├── layouts/
        │   └── MainLayout.jsx← App shell with sidebar
        ├── pages/
        │   └── DashboardPage.jsx ← Main dashboard
        └── components/
            ├── StatsCards.jsx
            ├── LogTable.jsx
            ├── LogFilters.jsx
            ├── SearchBar.jsx
            ├── UploadModal.jsx
            ├── LogDetailDrawer.jsx
            ├── SeverityTag.jsx
            └── StatusBadge.jsx
```

---

## 📑 MongoDB Indexes

The `Log` collection has the following indexes for optimal query performance:

| Index | Type | Purpose |
|---|---|---|
| `{ actor: 1 }` | Single | Filter/sort by actor |
| `{ timestamp: -1 }` | Single | Default sort, date range |
| `{ severity: 1 }` | Single | Filter by severity |
| `{ status: 1 }` | Single | Filter by status |
| `{ role: 1 }` | Single | Filter by role |
| `{ action: 1 }` | Single | Filter by action |
| `{ resourceType: 1 }` | Single | Filter by resource type |
| `{ region: 1 }` | Single | Filter by region |
| `{ ipAddress: 1 }` | Single | Filter by IP |
| `{ severity: 1, timestamp: -1 }` | Compound | Stats queries |
| `{ status: 1, timestamp: -1 }` | Compound | Stats queries |
| `{ uploadBatch: 1 }` | Single | Duplicate detection |
| Text index (8 fields) | Text | Full-text search |

---

## 🌐 Deployment

### Backend → Render

1. Push to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repository
4. Render auto-detects `render.yaml` and configures the service
5. Add environment variable in Render dashboard:
   - `MONGO_URI` → your MongoDB Atlas connection string
6. Deploy ✅

**Or configure manually:**
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node server.js`
- Environment: Node
- Health Check Path: `/health`

---

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_BASE_URL` → `https://your-backend.onrender.com/api`
5. Vercel auto-detects Vite — click **Deploy** ✅

`vercel.json` handles:
- SPA rewrite rule (React Router works on refresh)
- Immutable cache headers for hashed assets
- Security headers (X-Frame-Options, X-XSS-Protection, etc.)

---

### Database → MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist IP `0.0.0.0/0` (for Render) or specific Render IP
4. Copy the connection string → set as `MONGO_URI`
5. Indexes are created automatically when the app first starts

---

## 🧠 Technical Decisions

| Decision | Rationale |
|---|---|
| **ESM (`"type": "module"`)** | Modern JavaScript standard, cleaner import/export syntax |
| **`insertMany({ ordered: false })`** | Continues inserting after individual document failures (duplicates), maximizes throughput |
| **`lean()` on all read queries** | Returns plain JS objects instead of Mongoose Document instances — 30–40% faster, less memory |
| **`Promise.all` for stats** | Runs 4 aggregation queries in parallel instead of sequential — ~4x faster stats endpoint |
| **Text index weights** | Actor (10) > action (8) > resource (6) — makes search results prioritize the most relevant field |
| **Per-record validation in service** | Keeps validation logic reusable and testable outside of HTTP context |
| **`/stats` route before `/:id`** | Prevents Express from treating the literal string `"stats"` as a dynamic `:id` parameter |
| **`asyncHandler` wrapper** | Eliminates try/catch boilerplate in every controller — errors bubble to global handler |
| **50MB body limit** | Supports full 10,000-record JSON payloads (~5–10MB typical) |
| **`uploadBatch` UUID field** | Enables idempotent re-uploads — same batch can be detected |
| **Compound indexes** | `{severity, timestamp}` and `{status, timestamp}` cover the most common stats aggregation patterns |
| **Debounced search (400ms)** | Avoids firing an API request on every keystroke — reduces server load dramatically |
| **Code-split bundles** | Vendor, antd, router, utils in separate chunks — faster initial load via parallel downloads |

---

## 🔮 Future Improvements

| Feature | Description |
|---|---|
| **Authentication** | JWT-based auth with role-based access control (RBAC) |
| **CSV Upload** | Support `.csv` file parsing in addition to JSON |
| **Real-time Updates** | WebSocket or Server-Sent Events for live log streaming |
| **Alerting Rules** | Configurable thresholds that trigger notifications (e.g. >100 CRITICAL in 1 hour) |
| **Audit Trail** | Track who viewed/exported which logs |
| **Multi-tenant** | Namespace logs by organization/team |
| **Log Archival** | Move logs older than 90 days to cold storage (S3/GCS) |
| **Column Visibility** | Let users show/hide table columns |
| **Dark/Light Mode Toggle** | User-selectable theme preference |
| **Unit + Integration Tests** | Jest + Supertest for backend, Vitest for frontend |
| **Rate Limiting** | express-rate-limit on upload endpoint to prevent abuse |
| **Log Correlation** | Group related events by session or IP for investigation |

---

## 👨‍💻 Author

Built as an enterprise-grade security dashboard for intern/professional purposes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
