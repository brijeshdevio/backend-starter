import { CookieOptions, Response } from "express";
import { env } from "../config/env";

const baseCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
});

export const setCookie = (
  res: Response,
  name: string,
  value: string,
  options?: CookieOptions,
) => {
  res.cookie(name, value, {
    ...baseCookieOptions(),
    ...options,
  });
};

export const clearCookie = (
  res: Response,
  name: string,
  options?: CookieOptions,
) => {
  res.clearCookie(name, {
    ...baseCookieOptions(),
    ...options,
  });
};
