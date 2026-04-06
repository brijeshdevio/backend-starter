import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { userRouter } from "../modules/user/user.routes";
import { authMiddleware } from "../middleware/auth.middleware";
import { sessionRouter } from "../modules/session/session.routes";

export const routes = Router();

routes.use("/auth", authRouter);
routes.use("/users", authMiddleware, userRouter);
routes.use("/sessions", authMiddleware, sessionRouter);
