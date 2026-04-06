import { Router } from "express";
import { validateMiddleware } from "../../middleware/validate.middleware";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { ChangePasswordSchema, UpdateSchema } from "./user.schema";

export const userRouter = Router();
const usercontroller = new UserController(new UserService());

userRouter.get("/me", usercontroller.findById);
userRouter.patch(
  "/me",
  validateMiddleware(UpdateSchema),
  usercontroller.update,
);
userRouter.patch(
  "/change-password",
  validateMiddleware(ChangePasswordSchema),
  usercontroller.changePassword,
);
