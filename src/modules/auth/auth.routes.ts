import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { validate } from "../../middleware/validate";
import { LoginSchema, RegisterSchema } from "./auth.schema";
import { authenticate } from "../../middleware/authenticate";

export const authRoutes = Router();

const controllers = new AuthController(new AuthService());
authRoutes.post("/register", validate(RegisterSchema), controllers.register);
authRoutes.post("/login", validate(LoginSchema), controllers.login);
authRoutes.post("/refresh", controllers.refresh);
authRoutes.post("/logout", authenticate, controllers.logout);
authRoutes.get("/me", authenticate, controllers.getMe);
