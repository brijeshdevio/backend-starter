import { Request, Response } from "express";
import { apiResponse } from "../../utils/apiResponse";
import { SessionService } from "./session.service";

export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  private getUserId = (req: Request): string => {
    return ((req as any).user as { id: string }).id;
  };

  findAll = async (req: Request, res: Response) => {
    const sessions = await this.sessionService.findAll(this.getUserId(req));
    return apiResponse(res, {
      status: 200,
      data: sessions,
    });
  };
}
