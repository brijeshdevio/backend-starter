import { Request, Response, NextFunction } from "express";
import { ZodError, ZodIssue } from "zod";
import { apiResponse } from "../utils/api-response";
import { ERROR_CODES } from "../constants";
import { BadRequestException, HttpException } from "../utils/error";
import { env } from "../config/env";

const formatZodError = (issues: ZodIssue[]) => {
  return issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ZodError) {
    const formattedErrors = formatZodError(err.issues);
    const badRequestError = new BadRequestException(
      "Validation Error",
      formattedErrors,
    );
    return apiResponse(res, badRequestError.toResponse());
  }

  if (err instanceof HttpException) {
    return apiResponse(res, err.toResponse());
  }

  apiResponse(res, {
    success: false,
    status: 500,
    message: "Something went wrong",
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      details:
        env.NODE_ENV === "development"
          ? err instanceof Error
            ? { message: err.message, stack: err.stack }
            : String(err)
          : undefined,
    },
  });
};
