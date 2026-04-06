import { Router } from "express";
import { SessionController } from "./session.controller";
import { SessionService } from "./session.service";

export const sessionRouter = Router();
const sessionController = new SessionController(new SessionService());

sessionRouter.get("/", sessionController.findAll);
