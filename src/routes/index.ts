import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/users/users.routes";
import { authGuard } from "../middleware/auth-guard";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/users", authGuard, userRoutes);
