import rateLimit from "express-rate-limit";
import { Request } from "express";
import { getIpAddress } from "../utils/ipAddress";

type CustomOptions = {
  windowMs?: number;
  max?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
};

export const createRateLimiter = (options?: CustomOptions) => {
  return rateLimit({
    windowMs: options?.windowMs || 15 * 60 * 1000, // default 15 min
    max: options?.max || 100, // default 100 req
    standardHeaders: true,
    legacyHeaders: false,

    message: {
      success: false,
      status: 429,
      message: options?.message || "Too many requests, please try again later.",
    },

    keyGenerator:
      options?.keyGenerator ||
      ((req: Request) => getIpAddress(req) || "unknown"),

    skip: options?.skip || (() => false),
  });
};
