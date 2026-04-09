import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import { env } from "./config/env";
import { apiResponse } from "./utils/apiResponse";
import { ERROR_CODES } from "./constants";
import { errorMiddleware } from "./middleware/error.middleware";
import { routes } from "./routes";
import { createRateLimiter } from "./middleware/rateLimiter.middleware";
import { prisma } from "./lib/prisma";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND,
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

// Attach a unique request ID for tracing
app.use((req, _res, next) => {
  req.id = (req.headers["x-request-id"] as string) || randomUUID();
  next();
});

app.get("/", (_req, res) => {
  res.json({ status: "ok", name: "backend-template" });
});

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

app.use("/api", routes);

app.use("", (_req, res) => {
  return apiResponse(res, {
    status: 404,
    message: "Not Found",
    error: {
      code: ERROR_CODES.NOT_FOUND,
      details: "Please check the route name and method.",
    },
  });
});

app.use(errorMiddleware);

export default app;
