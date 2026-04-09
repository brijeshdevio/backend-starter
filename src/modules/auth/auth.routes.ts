import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { validateMiddleware } from "../../middleware/validate.middleware";
import { LoginSchema, RegisterSchema } from "./auth.schema";
import { authMiddleware } from "../../middleware/auth.middleware";
import { refreshTokenMiddleware } from "./auth.middleware";
import { createRateLimiter } from "../../middleware/rateLimiter.middleware";

export const authRouter = Router();
const authController = new AuthController(new AuthService());

authRouter.post(
  "/register",
  validateMiddleware(RegisterSchema),
  authController.register,
);
authRouter.post(
  "/login",
  createRateLimiter({
    max: 5,
    windowMs: 15 * 60 * 1000,
    message: "Too many login attempts, please try again later.",
  }),
  validateMiddleware(LoginSchema),
  authController.login,
);
authRouter.post(
  "/logout",
  authMiddleware,
  refreshTokenMiddleware,
  authController.logout,
);
authRouter.post("/refresh", refreshTokenMiddleware, authController.refresh);
