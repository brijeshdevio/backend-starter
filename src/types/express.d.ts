declare namespace Express {
  interface Request {
    user?: { id: string; email: string; role: string };
    validatedQuery?: Record<string, unknown>;
    validatedParams?: Record<string, unknown>;
  }
}
