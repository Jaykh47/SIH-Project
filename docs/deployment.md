# LANDSTACK — Deployment & Operations Guide

## 1. Local Development Quick Start

### Step 1: Clone & Configure
```bash
git clone <repo-url>
cd LandStack
cp .env.example .env
```

### Step 2: PostgreSQL & PostGIS Setup
Ensure PostgreSQL 16+ is running with the PostGIS extension installed. Run migrations:
```powershell
# In PowerShell or Bash:
psql -U postgres -d landstack -f database/migrations/001_create_extensions.sql
psql -U postgres -d landstack -f database/migrations/002_create_schema.sql
psql -U postgres -d landstack -f database/migrations/003_synthetic_seeds.sql
psql -U postgres -d landstack -f database/migrations/003b_seed_fixes.sql
```

### Step 3: Start Backend API
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:3001
```

### Step 4: Start Frontend SPA
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### Step 5: Start AI Microservice (Optional)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload
```

---

## 2. Docker Deployment

LANDSTACK includes production-ready Dockerfiles and a `docker-compose.yml` specification:

```bash
# Build and run all services in containers
docker-compose up --build -d

# Check status
docker-compose ps

# Access:
# - Frontend: http://localhost:5173
# - Backend:  http://localhost:3001/health
# - AI Service: http://localhost:8001/health
```

---

## 3. Production Hardening Checklist
- [x] Helmet.js security headers configured.
- [x] CORS restricted to authorized frontend domains.
- [x] Express rate limiting on `/api/*` endpoints.
- [x] Parameterized SQL queries preventing SQL injection.
- [x] Zod request payload schema validation.
- [x] Bcrypt password hashing for user credentials.
- [x] JWT token expiration and role-based access control.
