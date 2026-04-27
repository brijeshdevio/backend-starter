import expressRateLimit from "express-rate-limit";
import { Request } from "express";

type CustomOptions = {
  windowMs?: number;
  max?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
};

export const rateLimit = (options?: CustomOptions) => {
  return expressRateLimit({
    windowMs: options?.windowMs || 15 * 60 * 1000, // default 15 min
    max: options?.max || 100, // default 100 req
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      status: 429,
      message: options?.message || "Too many requests, please try again later.",
    },
    skip: options?.skip || (() => false),
  });
};
