import type { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../../utils/errors";

export function refreshTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.["refreshToken"];

  if (!token) {
    throw new UnauthorizedException(`Missing refresh token`);
  }
  req.body = {
    ...req.body,
    refreshToken: token,
  };

  next();
}
