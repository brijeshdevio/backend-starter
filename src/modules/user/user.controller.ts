import { Request, Response } from "express";
import { UserService } from "./user.service";
import { apiResponse } from "../../utils/apiResponse";

export class UserController {
  constructor(private readonly userService: UserService) {}

  private getUserId = (req: Request): string => {
    return ((req as any).user as { id: string }).id;
  };

  findById = async (req: Request, res: Response) => {
    const user = await this.userService.findById(this.getUserId(req));
    return apiResponse(res, {
      status: 200,
      data: user,
    });
  };

  update = async (req: Request, res: Response) => {
    const { name } = req.body;
    const user = await this.userService.update(this.getUserId(req), { name });
    return apiResponse(res, {
      status: 200,
      data: user,
      message: "User updated successfully",
    });
  };

  changePassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    await this.userService.changePassword(this.getUserId(req), {
      oldPassword,
      newPassword,
      confirmPassword,
    });
    return apiResponse(res, {
      status: 200,
      message: "Password changed successfully",
    });
  };
}
