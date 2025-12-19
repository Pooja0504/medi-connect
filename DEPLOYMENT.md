# Deployment Guide

Complete instructions for deploying MediConnect to various environments.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Health Checks & Monitoring](#health-checks--monitoring)
4. [Rollback Procedures](#rollback-procedures)

## Local Development

### Quick Start with Docker Compose

```bash
# Clone repository
git clone https://github.com/medi-connect/medi-connect.git
cd medi-connect

# Start services
docker-compose up -d

# Initialize database
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run seed

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# API Docs: http://localhost:5000/api-docs
```

### Manual Setup

```bash
# Backend
cd medi-connect-backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run prisma:migrate
npm run seed
npm run dev

# Frontend (new terminal)
cd medi-connect-frontend
npm install
npm run dev
```

## Docker Deployment

### Build Images

```bash
# Build backend
docker build -t mediconnect-backend:1.0.0 ./medi-connect-backend

# Build frontend
docker build -t mediconnect-frontend:1.0.0 ./medi-connect-frontend
```

### Run Services

```bash
# Start database
docker run -d \
  --name mediconnect-postgres \
  -e POSTGRES_USER=mediconnect \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=mediconnect \
  -p 5432:5432 \
  postgres:15-alpine

# Start backend
docker run -d \
  --name mediconnect-backend \
  --link mediconnect-postgres:postgres \
  -e DATABASE_URL=postgresql://mediconnect:secure_password@postgres:5432/mediconnect \
  -e JWT_SECRET=your-secret-key \
  -e NODE_ENV=production \
  -p 5000:5000 \
  mediconnect-backend:1.0.0

# Start frontend
docker run -d \
  --name mediconnect-frontend \
  -e NEXT_PUBLIC_API_URL=http://localhost:5000 \
  -p 3000:3000 \
  mediconnect-frontend:1.0.0
```

### Using Docker Compose

```bash
docker-compose up -d
docker-compose logs -f
```

**Stopping services**:
```bash
docker-compose down
```

## Health Checks & Monitoring

### Health Check Endpoint

```bash
curl http://localhost:5000/health
# Response: { "status": "ok" }
```

### Logs

**Docker**:
```bash
docker logs mediconnect-backend
docker-compose logs -f backend
```

### Monitoring

Monitor service health through Docker logs and health check endpoints.

## Rollback Procedures

### Docker

```bash
# Rollback to previous image
docker stop mediconnect-backend
docker rm mediconnect-backend
docker run -d \
  --name mediconnect-backend \
  mediconnect-backend:previous-version
```

### Database Rollback

```bash
# List migrations
cd medi-connect-backend
npm run prisma -- migrate status

# Rollback migration
npm run prisma -- migrate resolve --rolled-back "20240115000000_feature_name"
```

## Environment-Specific Configurations

### Development

```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/mediconnect_dev
JWT_SECRET=dev-secret-key-not-for-production
JWT_EXPIRY=86400
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
```