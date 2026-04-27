import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { validate } from "../../middleware/validate";
import { LoginSchema, RegisterSchema } from "./auth.schema";
import { authenticate } from "../../middleware/authenticate";
import { rateLimit } from "../../middleware/rate-limit";

export const authRoutes = Router();

const controllers = new AuthController(new AuthService());
authRoutes.post("/register", validate(RegisterSchema), controllers.register);
authRoutes.post(
  "/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
  }),
  validate(LoginSchema),
  controllers.login,
);
authRoutes.post("/refresh", controllers.refresh);
authRoutes.post("/logout", authenticate, controllers.logout);
authRoutes.get("/me", authenticate, controllers.getMe);
