import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validate<T extends z.ZodTypeAny>(
  schema: T,
  type: "body" | "query" | "params" = "body",
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (type === "body") {
        req.body = await schema.parseAsync(req.body);
      } else if (type === "query") {
        req.validatedQuery = (await schema.parseAsync(
          req.query,
        )) as Request["query"];
      } else if (type === "params") {
        req.validatedParams = (await schema.parseAsync(
          req.params,
        )) as Request["params"];
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
