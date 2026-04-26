import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/users/users.routes";
import { authenticate } from "../middleware/authenticate";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/users", authenticate, userRoutes);
