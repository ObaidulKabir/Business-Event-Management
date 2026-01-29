# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Business Event Manager is a full-stack application for tracking daily business interactions with stakeholders (employees, clients, designers, vendors) across multiple communication platforms (Email, WhatsApp, Messenger). The app supports file attachments, advanced filtering, search, and reporting with CSV export.

**Architecture**: Monorepo with separate backend (Node.js/Express/SQLite) and frontend (React/Vite) directories.

## Essential Commands

### Initial Setup
```powershell
# Backend setup (from project root)
cd backend
npm install
npm run init-db  # MUST run before first start - creates database schema and seed data

# Frontend setup (from project root)
cd frontend
npm install
```

### Development Workflow
```powershell
# Backend (runs on http://localhost:5000)
cd backend
npm run dev      # Uses nodemon for auto-reload

# Frontend (runs on http://localhost:3000)
cd frontend
npm run dev      # Uses Vite dev server with HMR

# Run both concurrently in separate terminals
```

### Testing
```powershell
# Backend integration tests
cd backend
npm test                           # Run all tests with Jest
npm test -- contacts.test.js       # Run specific test file
npm test -- --watch                # Watch mode for development
```

### Database Management
```powershell
cd backend
npm run init-db                    # Initialize/reset database
# Database file: backend/database/business_events.db
# Test database: backend/database/test_business_events.db
```

### Production Build
```powershell
cd frontend
npm run build    # Outputs to frontend/dist/
npm run preview  # Preview production build locally
```

## Architecture & Key Patterns

### Backend Structure
- **Database Layer**: Singleton pattern in `database/db.js` wraps sqlite3 with Promise-based API (`run`, `get`, `all`)
- **Route Modules**: Each route file (`routes/events.js`, `routes/contacts.js`, etc.) is an Express Router
- **File Uploads**: Multer middleware in `routes/events.js` handles multipart/form-data, stores files in `uploads/` directory
- **API Prefix**: All routes mounted under `/api/*` (e.g., `/api/events`, `/api/contacts`)

**Critical**: Database connection is a singleton. All route handlers use `require('../database/db')` to access the same instance.

### Frontend Structure  
- **Service Layer**: `services/api.js` centralizes all Axios calls - backend routes should match API service methods
- **Component Pattern**: Pages consume services, components are presentational (forms, cards)
- **Routing**: React Router v6 with nested routes in `App.jsx`
- **State Management**: Local component state with hooks (no global state library)
- **Proxy**: Vite proxies `/api` requests to `http://localhost:5000` (configured in `vite.config.js`)

**Critical**: Frontend assumes backend is running on port 5000. API calls use relative paths (`/api/...`) which Vite proxies during development.

### Database Schema Relationships
```
categories (1) ←─── (M) events (M) ──→ (1) contacts
                       │
                       └─── (1:M) ──→ attachments
```

**Foreign Key Behavior**:
- `events.contact_id` → `ON DELETE SET NULL` (events preserved if contact deleted)
- `events.category_id` → `ON DELETE SET NULL` (events preserved if category deleted)  
- `attachments.event_id` → `ON DELETE CASCADE` (attachments deleted with event)

### File Upload Flow
1. Frontend sends `multipart/form-data` via FormData to `POST /api/events`
2. Multer middleware intercepts, saves files to `uploads/` with timestamped names
3. Route handler inserts file metadata into `attachments` table with `event_id`
4. Static middleware serves files from `/uploads/*` path

**Important**: File deletion (when event deleted) requires manual cleanup in `routes/events.js` DELETE handler.

## API Endpoint Patterns

All endpoints follow RESTful conventions:
- List: `GET /api/{resource}` with optional query params for filtering
- Get: `GET /api/{resource}/:id`
- Create: `POST /api/{resource}` (returns `{ id, message }`)
- Update: `PUT /api/{resource}/:id`
- Delete: `DELETE /api/{resource}/:id`

**Query Parameter Filters**:
- Events: `category`, `contact`, `platform`, `startDate`, `endDate`
- Contacts: `type`
- Search: `q` (query string), `type` (events|contacts|attachments)
- Reports: `startDate`, `endDate`, `category`, `contact`, `platform`

## Testing Architecture

Integration tests use:
- `tests/setup.js`: Creates isolated test database (`test_business_events.db`)
- `tests/app.js`: Express app instance without `app.listen()` for supertest
- Test files follow pattern: `{resource}.test.js` (e.g., `contacts.test.js`)

**Test Database Lifecycle**:
- `beforeAll`: Creates fresh database with schema and seed data
- `afterAll`: Deletes test database file
- Each test suite manages its own test data (create → test → cleanup)

## Environment Configuration

Backend `.env` (default values shown):
```
PORT=5000
DB_PATH=./database/business_events.db
UPLOAD_PATH=../uploads
```

**Note**: `.env` file is gitignored but included in repo for development convenience. Production should override these values.

## Windows-Specific Notes

PowerShell script execution must be enabled before running npm scripts:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Use PowerShell syntax for multi-step commands:
```powershell
cd backend; npm install     # Semicolon separator in PowerShell
```

## Common Debugging Scenarios

**"Cannot GET /api/..."**: Backend not running or wrong port. Check `http://localhost:5000/api/health`

**Database errors on startup**: Run `npm run init-db` from backend directory

**File upload fails**: Verify `uploads/` directory exists at project root (sibling to `backend/` and `frontend/`)

**Frontend 404 on refresh**: Vite dev server doesn't handle SPA routing. Use in-app navigation or restart dev server.

**CORS errors**: Backend must be running with cors middleware enabled (default in `server.js`)
