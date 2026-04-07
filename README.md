# Secure Backend Template

A production-ready, highly secure backend template built with modern Node.js technologies. Designed for seamless deployment to serverless environments like Vercel.

## 🚀 Tech Stack

- **Framework**: [Express 5](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma 7](https://www.prisma.io/)
- **Database**: [PostgreSQL (Neon)](https://neon.tech/)
- **Validation**: [Zod](https://zod.dev/)
- **Authentication**: JWT (Access & Refresh Tokens) + Cookie-based
- **Deployment**: [Vercel Serverless](https://vercel.com/)

## ✨ Key Features

- **Robust Authentication**: Secure Register, Login, Logout, and Refresh flows using HTTP-only cookies.
- **Session Management**: Track and manage user sessions including device type, OS, browser, and IP address.
- **Advanced Security**:
  - Argon2id password hashing with timing-attack protection.
  - Rate limiting to prevent brute-force and DoS attacks.
  - JWT payload validation using Zod.
  - Session invalidation upon password change.
  - `express.json` body size limits.
  - Helmet for security headers and configured CORS.
- **Error Handling**: Centralized, safe error handling preventing leak of stack traces in production and properly formatting Zod validation errors.
- **Developer Experience**: Fast restarts using `tsx` and structured routing & controller architecture.

## 📁 Folder Structure

```
.
├── api.http                # REST Client requests for testing APIs
├── prisma/
│   └── schema.prisma       # Prisma database schema definition
└── src/
    ├── config/             # Environment variable validation and loading
    ├── constants/          # Application-wide constants (e.g., expiry times, error codes)
    ├── lib/                # Wrappers around external libraries (Argon, Prisma, JWT, Crypto)
    ├── middleware/         # Express middlewares (Auth, Error, Rate Limiter, Validation)
    ├── modules/            # Domain-specific feature modules
    │   ├── auth/           # Authentication features
    │   ├── session/        # Session tracking features
    │   └── user/           # User profile and account features
    ├── routes/             # Global API router aggregation
    ├── types/              # TypeScript global type augmentations (e.g., Express Request)
    ├── utils/              # Helper utilities (API Response formatter, custom Error classes)
    ├── app.ts              # Express application setup
    └── server.ts           # Development server entry point & Vercel export
```

## 🛠 Prerequisites

- Node.js >= 20
- [pnpm](https://pnpm.io/) package manager
- A PostgreSQL database (e.g., [Neon Serverless Postgres](https://neon.tech))

## ⚙️ Setup & Installation

1. **Clone and Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory and configure it based on `.env.example`:
   ```env
   NODE_ENV="development"
   PORT=3000
   DATABASE_URL="postgresql://user:password@hostname/dbname"
   JWT_SECRET="your-secure-random-secret-string-min-32-chars"
   FRONTEND="http://localhost:5173"
   ```

3. **Database Migration**
   Generate the Prisma client and push the schema to your database:
   ```bash
   npx prisma db push
   # or for migrations: npx prisma migrate dev
   ```

4. **Start Development Server**
   ```bash
   pnpm run dev
   ```

## 📜 Available Scripts

- `pnpm run dev`: Starts the development server using `nodemon` and `tsx`.
- `pnpm run build`: Compiles TypeScript to JavaScript in the `dist/` directory.
- `pnpm run start`: Runs the compiled build in production.
- `pnpm run postinstall`: Automatically generates the custom Prisma client.

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Root info | ❌ |
| `GET` | `/health` | DB connection health check | ❌ |
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and receive HTTP-only cookies | ❌ |
| `POST` | `/api/auth/refresh` | Refresh access token via refresh cookie | Partially (Refresh Cookie) |
| `POST` | `/api/auth/logout` | Invalidate current session and clear cookies| ✅ |
| `GET` | `/api/users/me` | Get current user's profile | ✅ |
| `PATCH`| `/api/users/me` | Update current user's profile | ✅ |
| `PATCH`| `/api/users/change-password`| Change password & invalidate all sessions | ✅ |
| `GET` | `/api/sessions` | List active sessions for the current user | ✅ |

> **Note**: For detailed payload examples, refer to the `api.http` file included in the repository.

## ☁️ Deployment (Vercel)

This template is configured out-of-the-box for Vercel Serverless Functions.

1. Ensure `vercel.json` is present in the root.
2. In your Vercel Dashboard, set the **Framework Preset** to `Other`.
3. Add your Environment Variables (`DATABASE_URL`, `JWT_SECRET`, etc.).
4. Overwrite the **Install Command**: `pnpm install`
5. The `postinstall` script will automatically generate the Prisma client during the build step.
6. Deploy!
