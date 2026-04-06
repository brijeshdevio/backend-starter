import { CookieOptions, Response } from "express";
import { env } from "../config/env";

export const setCookie = (
  res: Response,
  name: string,
  value: string,
  options: CookieOptions,
) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    ...options,
  });
};

export const clearCookie = (res: Response, name: string) => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  });
};
