import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validateMiddleware<T extends z.ZodTypeAny>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.body);

      // ✅ overwrite with validated + sanitized data
      req.body = parsed;

      next();
    } catch (err) {
      // ✅ pass ZodError to global error handler
      next(err);
    }
  };
}
