# MediConnect - Healthcare Appointment & Clinical Notes Platform

![Build Status](https://github.com/medi-connect/medi-connect/actions/workflows/ci-cd.yml/badge.svg)
![Code Coverage](https://img.shields.io/badge/coverage-90%2B%25-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**MediConnect** is an enterprise-grade healthcare platform that enables secure appointment scheduling, doctor-patient communication, and clinical note management with HIPAA-compliant security controls, comprehensive testing, and production-ready infrastructure.

## 🏥 Features

### Core Functionality
- **User Management**: Role-based authentication (PATIENT, DOCTOR) with JWT tokens
- **Appointment Scheduling**: Book, view, and manage medical appointments
- **Clinical Notes**: Secure doctor-to-patient clinical documentation
- **Doctor Directory**: Search and view available doctors by specialization
- **Real-time Data**: Upcoming appointments and clinical history tracking

### Security & Compliance
- **HIPAA Compliance**: PHI masking in logs, encrypted data storage
- **JWT Authentication**: Stateless token-based security
- **Role-Based Access Control (RBAC)**: Fine-grained authorization per endpoint
- **Input Validation**: Comprehensive validation for all user inputs
- **Password Security**: Bcrypt hashing with salt
- **Audit Logging**: Complete audit trail of user actions

### Engineering Excellence
- **90%+ Code Coverage**: Mandatory unit + integration testing
- **OpenAPI 3.0 Documentation**: Auto-generated API specs with Swagger UI
- **CI/CD Pipeline**: GitHub Actions automation with lint, test, build, deploy
- **Docker Containerization**: Multi-stage builds for optimized images
- **Database Migrations**: Prisma ORM with version-controlled schema
- **Error Handling**: Structured error codes and correlation IDs for tracing

## 🏗️ Architecture

```
MediConnect/
├── medi-connect-backend/        # Node.js/Express API
│   ├── src/
│   │   ├── app.ts              # Express app with Swagger UI
│   │   ├── server.ts           # Server bootstrap
│   │   ├── config/             # Environment and database config
│   │   ├── middlewares/        # Auth and RBAC middlewares
│   │   ├── modules/            # Feature modules (auth, appointments, notes, doctors)
│   │   ├── shared/             # Utilities (validation, logging, errors, repositories)
│   │   └── types/              # TypeScript interfaces and enums
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── migrations/         # Database version history
│   ├── __tests__/              # Test suites (90%+ coverage required)
│   ├── openapi.yaml            # OpenAPI 3.0 specification
│   ├── Dockerfile              # Multi-stage Docker build
│   └── package.json            # Dependencies & scripts
│
├── medi-connect-frontend/       # Next.js React frontend
│   ├── src/
│   │   ├── app/               # Next.js app router
│   │   ├── lib/               # Utilities and API client
│   │   └── components/        # React components
│   ├── public/                # Static assets
│   └── package.json
│
└── .github/workflows/          # CI/CD automation
    └── ci-cd.yml              # GitHub Actions pipeline
```

### Technology Stack

**Backend**
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Authentication**: JWT with RS256 signing
- **Validation**: Custom validators with regex patterns
- **Logging**: PHI-safe logger with deep object masking

**Frontend**
- **Framework**: Next.js 14+ (React)
- **Language**: TypeScript
- **HTTP Client**: Axios with centralized configuration
- **Styling**: CSS Modules with PostCSS

**DevOps**
- **Containerization**: Docker with multi-stage builds
- **CI/CD**: GitHub Actions
- **Testing**: Jest with supertest for integration tests
- **Code Quality**: ESLint, TypeScript strict mode
- **Security**: Trivy vulnerability scanning

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd medi-connect-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Setup database**
   ```bash
   npm run prisma:migrate
   ```

5. **Seed test data**
   ```bash
   npm run seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:5000`
   API docs available at `http://localhost:5000/api-docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd medi-connect-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:3000`

## 📚 API Documentation

### OpenAPI/Swagger

Full interactive API documentation is available at:
- **Development**: `http://localhost:5000/api-docs`
- **Production**: `https://api.mediconnect.health/api-docs`

### Authentication

All API requests (except registration/login) require JWT token in header:

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/appointments/patient/upcoming
```

### Key Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login and get token | ❌ |
| POST | `/appointments/patient` | Create appointment | ✅ PATIENT |
| GET | `/appointments/patient/upcoming` | Get patient appointments | ✅ PATIENT |
| GET | `/appointments/doctor/upcoming` | Get doctor appointments | ✅ DOCTOR |
| POST | `/notes` | Create clinical note | ✅ DOCTOR |
| GET | `/notes/{appointmentId}` | Get appointment notes | ✅ |
| GET | `/doctors` | List all doctors | ✅ |

See [openapi.yaml](./medi-connect-backend/openapi.yaml) for complete API specification.

## 🧪 Testing

### Run All Tests

```bash
cd medi-connect-backend
npm run test
```

### Test Coverage Report

```bash
npm run test:coverage
```

Coverage requirements:
- **Minimum**: 90%
- **Critical paths**: 100% (auth, RBAC, PHI handling)

### Test Suites

- **Unit Tests**: `src/modules/*/[module].test.ts`
  - Auth (registration, login, validation)
  - Appointments (CRUD, date validation, RBAC)
  - Notes (creation, authorization, PHI handling)

- **Integration Tests**: Full API endpoint testing
  - End-to-end flows
  - Error scenarios
  - Authorization enforcement
  - Data persistence

Run specific test suite:
```bash
npm run test -- auth.test.ts
npm run test -- appointments.test.ts
```

## 🔒 Security & Compliance

### HIPAA Safeguards

1. **Protected Health Information (PHI) Masking**
   - Logs automatically redact: emails, phone numbers, SSNs, credit cards, passwords
   - Deep object masking prevents accidental PII leakage
   - [See logger.ts](./medi-connect-backend/src/shared/logger.ts)

2. **Input Validation & Sanitization**
   - Email format validation
   - Password strength (8-128 chars)
   - Note content length limits (10-10,000 chars)
   - Appointment date validation (future only)
   - [See validation.ts](./medi-connect-backend/src/shared/validation.ts)

3. **Authentication & Authorization**
   - JWT tokens with configurable expiration
   - Role-based middleware enforcement
   - Password hashing with bcrypt (salt rounds: 10)
   - [See auth.middleware.ts](./medi-connect-backend/src/middlewares/auth.middleware.ts)

4. **Audit Logging**
   - All user actions logged with timestamp and user ID
   - Sensitive data redacted in logs
   - Correlation IDs for request tracing
   - [See audit.service.ts](./medi-connect-backend/src/modules/audit/audit.service.ts)

### Database Security

- Encrypted at-rest (PostgreSQL SSL)
- Row-level security via Prisma
- Migrations tracked in version control
- Automatic backups (production)

## 🔄 CI/CD Pipeline

GitHub Actions automates:

1. **Lint & Code Quality**
   - TypeScript strict mode compilation
   - ESLint checks

2. **Testing** (on every PR/push)
   - Unit tests with supertest
   - Integration tests against test database
   - **Mandatory 90% coverage threshold**
   - Coverage reports uploaded to Codecov

3. **Security Scanning**
   - Trivy vulnerability scanning
   - npm audit for dependency vulnerabilities

4. **Docker Build**
   - Multi-stage builds for optimized images
   - Caching for faster builds

5. **Integration Tests**
   - Full API flow testing
   - Database migrations verified

### Pipeline Execution

View pipeline status: `.github/workflows/ci-cd.yml`

Trigger pipeline:
```bash
git push origin feature-branch
# or
git merge main
```

## 📊 Code Quality Standards

### TypeScript Configuration
- Strict mode enabled
- No implicit `any`
- Strict null checks
- ESNext target

### Testing Standards
- Minimum 90% code coverage
- All critical paths: 100% coverage
- Integration tests for all endpoints
- Error scenario validation

### Code Organization
- **Repository Pattern**: Data access layer abstraction
- **DTOs**: Explicit request/response schemas
- **Error Handling**: Structured AppError with correlation IDs
- **Validation**: Centralized validators

## 🛠️ Development Workflow

### Create Feature Branch
```bash
git checkout -b feature/your-feature
```

### Make Changes & Run Tests
```bash
npm run dev           # Start dev server
npm run test          # Run tests
npm run test:watch   # Watch mode
npm run lint         # Lint code
```

### Commit & Push
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature
```

### Create Pull Request
- CI/CD runs automatically
- Must pass all checks (lint, tests, coverage)
- Code review required
- Merge to main for deployment

## 📦 Docker Deployment

### Build Images

```bash
# Backend
docker build -t mediconnect-backend:latest ./medi-connect-backend

# Frontend
docker build -t mediconnect-frontend:latest ./medi-connect-frontend
```

### Run with Docker Compose

```bash
docker-compose up -d
```

Access:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- API Docs: `http://localhost:5000/api-docs`

## 📝 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mediconnect

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=3600

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```