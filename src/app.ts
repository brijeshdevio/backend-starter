import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { routes } from "./routes";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { logger } from "./lib/logger";
import { rateLimit } from "./middleware/rate-limit";

export const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(rateLimit());

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
      },
      "request completed",
    );
  });
  next();
});

app.get("/", (_, res) => {
  res.send(`Welcome to the Backend Starter!`);
});

app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1", routes);

app.use(errorHandler);
