# Quick Reference Guide

Common commands and procedures for MediConnect development and deployment.

## Development

### Start Development Environment

```bash
# One-line Docker start (everything)
docker-compose up -d

# Or manual setup
cd medi-connect-backend && npm install && npm run prisma:migrate && npm run dev
# In another terminal
cd medi-connect-frontend && npm install && npm run dev
```

### View Running Services

```bash
# Docker
docker ps
docker-compose ps

# Web URLs
Frontend:   http://localhost:3000
Backend:    http://localhost:5000
API Docs:   http://localhost:5000/api-docs
Database:   localhost:5432
```

### Database Management

```bash
# Migrations
npm run prisma:migrate    # Create new migration
npm run prisma -- migrate status  # Check status

# Seed data
npm run seed

# Database shell
docker-compose exec postgres psql -U mediconnect -d mediconnect
```

## Testing

### Run Tests

```bash
cd medi-connect-backend

# All tests with coverage
npm run test

# Watch mode
npm run test:watch

# Specific test file
npm run test -- auth.test.ts

# Coverage report
npm run test:coverage
```

### Test Coverage Report

```bash
# Generate HTML report
npm run test:coverage

# View report
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html  # Windows
```

## Building & Deployment

### Docker Build

```bash
# Build images
docker build -t mediconnect-backend:1.0.0 ./medi-connect-backend
docker build -t mediconnect-frontend:1.0.0 ./medi-connect-frontend

# Tag for registry
docker tag mediconnect-backend:1.0.0 <registry>/mediconnect-backend:1.0.0
docker push <registry>/mediconnect-backend:1.0.0
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Restart specific service
docker-compose restart backend
```

## Code Quality

### Lint & Type Check

```bash
cd medi-connect-backend

# TypeScript compilation check
npm run lint

# Fix formatting (if prettier configured)
npx prettier --write src/

# ESLint check
npx eslint src/
```

### Build

```bash
# TypeScript compilation
npm run build

# Output to dist/
ls -la dist/
```

## Debugging

### Logs

```bash
# Backend logs (Docker)
docker-compose logs -f backend

# Backend logs (Local)
tail -f logs/app.log

# Database logs
docker-compose logs -f postgres
```

### Database Inspection

```bash
# Connect to database
docker-compose exec postgres psql -U mediconnect -d mediconnect

# Common queries
\dt                    # List tables
SELECT * FROM "User";  # Query table
\d "User"             # Describe table structure
```

### API Testing

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "role": "PATIENT"
  }'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Get upcoming appointments (with token)
curl http://localhost:5000/appointments/patient/upcoming \
  -H "Authorization: Bearer <token>"
```

### Browser DevTools

**Frontend Debugging**:
- Chrome DevTools: F12 or Cmd+Option+I
- Network tab: Monitor API calls
- Console: Check for errors
- Application tab: View localStorage/tokens

**API Documentation**:
- Swagger UI: http://localhost:5000/api-docs
- OpenAPI Spec: http://localhost:5000/openapi.yaml

## Git Workflow

### Create Feature Branch

```bash
git checkout -b feature/your-feature-name
git branch  # Verify current branch
```

### Commit & Push

```bash
git add .
git commit -m "feat: description of feature"
git push origin feature/your-feature-name
```

### Create Pull Request

```bash
# GitHub CLI (if installed)
gh pr create --title "Your PR Title" --body "Description"

# Or use GitHub web interface
# github.com/medi-connect/medi-connect/pull/new/feature/your-feature-name
```

### Merge & Cleanup

```bash
git checkout main
git pull origin main
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Environment Setup

### Required Environment Variables

```bash
# .env file for backend
DATABASE_URL=postgresql://user:pass@localhost:5432/mediconnect
JWT_SECRET=your-secret-key
JWT_EXPIRY=3600
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Generate JWT Secret

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Linux/Mac
cat /dev/urandom | head -c 32 | xxd -p
```

## Performance

### Load Testing

```bash
# Install Apache Bench
apt-get install apache2-utils  # Linux
brew install httpd              # macOS

# Simple load test
ab -n 1000 -c 100 http://localhost:5000/health
```

### Monitor Resources

```bash
# Docker resource usage
docker stats

# System resources
top
htop
```

## Database

### Backup & Restore

```bash
# Backup
docker-compose exec postgres pg_dump -U mediconnect mediconnect > backup.sql

# Restore
cat backup.sql | docker-compose exec -T postgres psql -U mediconnect mediconnect
```

### Reset Database

```bash
# Stop containers
docker-compose down

# Remove data volume
docker volume rm medi-connect_postgres_data

# Restart
docker-compose up -d
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run seed
```

## Common Issues & Solutions

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000      # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>
```

### Docker Issues

```bash
# Remove dangling images
docker image prune -a

# Rebuild without cache
docker-compose build --no-cache

# Clean up everything (warning: destructive)
docker system prune -a --volumes
```

### Database Connection Issues

```bash
# Verify database is running
docker-compose ps postgres

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "\dt"
```

### Test Coverage Not Meeting 90%

```bash
# Check coverage report
npm run test:coverage

# View detailed coverage
open coverage/lcov-report/index.html

# See which files need coverage
grep -r "uncovered" coverage/
```

## Useful Resources

- [API Documentation](http://localhost:5000/api-docs)
- [GitHub Repository](https://github.com/medi-connect/medi-connect)
- [Contributing Guide](./CONTRIBUTING.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Policy](./SECURITY.md)
- [Main README](./README.md)

## Command Shortcuts

Create aliases in your shell profile (.bashrc, .zshrc):

```bash
# Development
alias mc-dev="cd ~/projects/medi-connect && docker-compose up -d"
alias mc-logs="docker-compose logs -f"
alias mc-test="cd medi-connect-backend && npm test"
alias mc-build="docker-compose build"
alias mc-down="docker-compose down"

# Git
alias gco="git checkout"
alias gcb="git checkout -b"
alias gp="git push origin"
alias gpl="git pull origin"
alias gcm="git commit -m"

# Database
alias mc-db="docker-compose exec postgres psql -U mediconnect -d mediconnect"
alias mc-migrate="cd medi-connect-backend && npm run prisma:migrate"
alias mc-seed="cd medi-connect-backend && npm run seed"
```

---

**Last Updated**: 2024-01-15
**Version**: 1.0
