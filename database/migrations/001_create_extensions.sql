-- Migration 001: Enable required PostgreSQL extensions
-- Run as superuser (postgres)
-- Purpose: Enable PostGIS spatial extension and other required extensions

-- PostGIS: Adds spatial/GIS capabilities to PostgreSQL
-- This is what allows us to store parcel geometries and run spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- uuid-ossp: Generate UUID primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgcrypto: Password hashing (additional security option)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify extensions are installed
SELECT name, default_version, installed_version
FROM pg_available_extensions
WHERE name IN ('postgis', 'uuid-ossp', 'pgcrypto')
ORDER BY name;
