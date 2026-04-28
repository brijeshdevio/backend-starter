# 🚀 Production-ready Node.js Backend Starter

A clean, minimal, and production-ready REST API starter built with **Express 5**, **TypeScript**, **Prisma**, and **PostgreSQL** — with auth, logging, validation, rate limiting, and a consistent response format out of the box.

> Skip the boilerplate. Start building features.

---

## ✨ What's Included

| Feature          | Tech                         |
| ---------------- | ---------------------------- |
| Framework        | Express 5 + TypeScript       |
| Database         | PostgreSQL via Prisma 7      |
| Authentication   | JWT (jsonwebtoken)           |
| Password Hashing | Argon2                       |
| Validation       | Zod v4                       |
| Logging          | Pino + pino-pretty           |
| Security         | Helmet + CORS                |
| Rate Limiting    | express-rate-limit           |
| Response Format  | Custom `apiResponse` utility |

---

## 📁 Project Structure

```
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── prisma.config.ts
├── prisma
│   ├── migrations
│   │   ├── 20260424062803_init
│   │   │   └── migration.sql
│   └── schema.prisma
├── src
│   ├── app.ts
│   ├── config
│   │   └── env.ts
│   ├── constants
│   │   └── index.ts
│   ├── lib
│   │   ├── logger.ts
│   │   └── prisma.ts
│   ├── middleware
│   │   ├── auth-guard.ts
│   │   ├── error-handler.ts
│   │   ├── rate-limit.ts
│   │   ├── role-guard.ts
│   │   └── validate.ts
│   ├── modules
│   │   ├── auth
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── auth.service.ts
│   │   └── users
│   │       ├── users.controller.ts
│   │       ├── users.routes.ts
│   │       ├── users.schema.ts
│   │       └── users.service.ts
│   ├── routes
│   │   └── index.ts
│   ├── server.ts
│   ├── types
│   │   └── express.d.ts
│   └── utils
│       ├── api-response.ts
│       ├── cookie.ts
│       └── error.ts
├── tsconfig.json
└── vercel.json
```

---

## ⚡ Getting Started

### 1. Clone & install

```bash
git clone https://github.com/brijeshdevio/backend-starter.git
cd backend-starter
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
NODE_ENV="development"
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/backend_starter?schema=public"
JWT_SECRET="your-secret-min-32-chars"
JWT_EXPIRES_IN="15m"
CLIENT_URL="http://localhost:5173"
LOG_LEVEL="info"
```

### 3. Run database migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the dev server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

---

## 📡 API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Auth

| Method | Endpoint         | Access  | Description           |
| ------ | ---------------- | ------- | --------------------- |
| `POST` | `/auth/register` | Public  | Create a new account  |
| `POST` | `/auth/login`    | Public  | Login and receive JWT |
| `POST` | `/auth/refresh`  | 🔒 Auth | Rotate refresh token  |
| `POST` | `/auth/logout`   | 🔒 Auth | Logout                |
| `GET`  | `/auth/me`       | 🔒 Auth | Get current user info |

### Users

| Method   | Endpoint     | Access   | Description                |
| -------- | ------------ | -------- | -------------------------- |
| `GET`    | `/users`     | 🔒 Admin | List all users (paginated) |
| `GET`    | `/users/:id` | 🔒 Auth  | Get a user by ID           |
| `PATCH`  | `/users/:id` | 🔒 Auth  | Update your own profile    |
| `DELETE` | `/users/:id` | 🔒 Admin | Delete a user              |

### System

| Method | Endpoint  | Access | Description  |
| ------ | --------- | ------ | ------------ |
| `GET`  | `/health` | Public | Health check |

---

## 📦 Response Format

Every response follows a consistent shape:

**Success**

```json
{
  "success": true,
  "status": 200,
  "message": "Users fetched",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

**Error**

```json
{
  "success": false,
  "status": 401,
  "message": "Invalid credentials"
}
```

**Validation Error (Zod)**

```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email"],
    "password": ["String must contain at least 8 character(s)"]
  }
}
```

---

## 🛡️ Auth Flow

```
POST /auth/register  →  creates account, returns user
POST /auth/login     →  returns JWT (expires in 15m)
POST /auth/refresh   →  rotate refresh token
POST /auth/logout    →  logout and delete session
GET  /auth/me        →  Authorization: Bearer <token>

```

Passwords are hashed with **Argon2** (more secure than bcrypt).  
Tokens are signed with `JWT_SECRET` and expire based on `JWT_EXPIRES_IN`.

---

## 🔒 Rate Limiting

| Route               | Limit                 |
| ------------------- | --------------------- |
| All `/api/*` routes | 100 requests / 15 min |
| `/auth/login`       | 10 requests / 15 min  |

When the limit is exceeded:

```json
{
  "success": false,
  "status": 429,
  "message": "Too many requests, please try again later."
}
```

---

## 🧪 Testing the API

You can use [Postman](https://postman.com), [Insomnia](https://insomnia.rest), or `curl`:

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Brijesh", "email": "brijesh@dev.in", "password": "Secure@123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "brijesh@dev.in", "password": "Secure@123"}'

# Get current user
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <your_token>"
```

---

## 📜 Available Scripts

```bash
npm run dev       # Start dev server with hot reload (tsx watch)
npm run build     # Compile TypeScript to /dist
npm run start     # Run compiled production build
```

---

## 🗄️ Database Schema

Managed by Prisma. Edit `prisma/schema.prisma` to add your models.

```bash
# After editing schema.prisma:
npx prisma migrate dev --name your_migration_name
```

Current models: `User` (with `USER` / `ADMIN` roles)

---

## 🧱 Tech Versions

| Package        | Version |
| -------------- | ------- |
| express        | ^5.2.1  |
| typescript     | ^6.0.3  |
| @prisma/client | ^7.8.0  |
| zod            | ^4.3.6  |
| argon2         | ^0.44.0 |
| pino           | ^10.3.1 |
| jsonwebtoken   | ^9.0.3  |

---

## 🗺️ What's Next

This starter is intentionally minimal. Extend it based on your project needs:

- [ ] Refresh token rotation
- [ ] Email verification
- [ ] File uploads (Multer / S3)
- [ ] Redis caching
- [ ] Docker + docker-compose
- [ ] GitHub Actions CI/CD
- [ ] Stripe billing integration

---

## 📄 License

MIT — free to use, fork, and build on.

---

<p align="center">Built by <a href="https://github.com/brijeshdevio">@brijeshdevio</a></p>
