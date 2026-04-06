import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const signJwt = (payload: Record<string, any>): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });
};

export const verifyJwt = <T>(token: string): T => {
  return jwt.verify(token, env.JWT_SECRET) as unknown as T;
};
