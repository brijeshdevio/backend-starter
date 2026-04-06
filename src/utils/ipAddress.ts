import { Request } from "express";

export const getIpAddress = (req: Request): string => {
  return ((req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    null) as string;
};
