import type { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { UnauthorizedException } from "../utils/error";
import { env } from "../config/env";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token =
    req.cookies?.["accessToken"] ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new UnauthorizedException("Access token missing");
  }

  try {
    const payload = verify(token, env.JWT_SECRET) as unknown as {
      sub: string;
      email: string;
      role: string;
    };
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    throw new UnauthorizedException("Invalid or expired access token");
  }
}
