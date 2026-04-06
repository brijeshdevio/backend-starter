import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { env } from "./config/env";
import { apiResponse } from "./utils/apiResponse";
import { ERROR_CODES } from "./constants";
import { errorMiddleware } from "./middleware/error.middleware";
import { routes } from "./routes";
import { createRateLimiter } from "./middleware/rateLimite.middleware";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND,
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

app.get("/", (req, res) => {
  res.send("Welcome to the Backend Template");
});

app.get("/health", (_, res) => {
  res.send("OK");
});

app.use("/api", routes);

app.use("", (_, res) => {
  return apiResponse(res, {
    status: 404,
    message: "Not Found",
    error: {
      code: ERROR_CODES.NOT_FOUND,
      details: `Please check the route name and method.`,
    },
  });
});

app.use(errorMiddleware);

export default app;
