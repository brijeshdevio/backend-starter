import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { apiResponse } from "../../utils/api-response";
import { clearCookie, setCookie } from "../../utils/cookie";
import { UnauthorizedException } from "../../utils/error";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const data = await this.authService.register(req.body);
    apiResponse(res, {
      status: 201,
      message: "User created successfully",
      data,
    });
  };

  login = async (req: Request, res: Response) => {
    const { accessToken, refreshToken } = await this.authService.login(
      req.body,
    );
    setCookie(res, "accessToken", accessToken, {
      maxAge: 15 * 60 * 1000,
    });
    setCookie(res, "refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    apiResponse(res, { message: "Login successful" });
  };

  refresh = async (req: Request, res: Response) => {
    const rawToken = req.cookies?.["refreshToken"];
    if (!rawToken) throw new UnauthorizedException(`Refresh token missing`);

    const { accessToken, refreshToken } =
      await this.authService.refresh(rawToken);
    setCookie(res, "accessToken", accessToken, {
      maxAge: 15 * 60 * 1000,
    });
    setCookie(res, "refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    apiResponse(res, { message: "Token refreshed successfully" });
  };

  logout = async (req: Request, res: Response) => {
    const rawToken = req.cookies?.["refreshToken"];
    if (!rawToken) throw new UnauthorizedException(`Refresh token missing`);

    await this.authService.logout(rawToken);
    clearCookie(res, "accessToken", { maxAge: 0 });
    clearCookie(res, "refreshToken", { maxAge: 0 });

    apiResponse(res, { message: "Logout successful" });
  };

  getMe = async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedException();

    const data = await this.authService.getMe(req.user.id);
    apiResponse(res, { data });
  };
}
