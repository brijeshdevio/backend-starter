import { Request, Response } from "express";
import { UsersService } from "./users.service";
import { UnauthorizedException } from "../../utils/error";
import { FindUsersQueryDto } from "./users.schema";
import { apiResponse } from "../../utils/api-response";

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  findAllUsers = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new UnauthorizedException();
    const query = req.validatedQuery as unknown as FindUsersQueryDto;

    const { users, meta } = await this.usersService.findAllUsers(
      user.id,
      query,
    );

    apiResponse(res, {
      data: users,
      meta,
    });
  };
}
