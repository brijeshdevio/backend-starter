import crypto from "node:crypto";
import { hash, verify } from "argon2";
import { sign, SignOptions } from "jsonwebtoken";
import { LoginDto, RegisterDto } from "./auth.schema";
import { prisma } from "../../lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "../../utils/error";
import { DUMMY_HASH, PRISMA_CODES } from "../../constants";
import { env } from "../../config/env";

export class AuthService {
  constructor() {}

  async register(data: RegisterDto) {
    try {
      const passwordHash = await hash(data.password);
      return await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === PRISMA_CODES.CONFLICT
      ) {
        throw new ConflictException("User with this email already exists");
      }
      throw new InternalServerErrorException();
    }
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    const passwordHash = user?.passwordHash ?? DUMMY_HASH;
    const isPasswordValid = await verify(passwordHash, data.password);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException();
    }

    return await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async refresh(rawToken: string) {
    const hashedToken = this.hashToken(rawToken);

    const session = await prisma.session.findFirst({
      where: {
        refreshTokens: {
          some: {
            tokenHash: hashedToken,
            expiresAt: { gt: new Date() },
          },
        },
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException(`Invalid or expired refresh token`);
    }

    const accessToken = this.generateAccessToken({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    const newRefreshToken = await this.generateRefreshToken(session.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(rawToken: string) {
    await prisma.session.deleteMany({
      where: {
        refreshTokens: {
          some: {
            tokenHash: this.hashToken(rawToken),
          },
        },
      },
    });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private generateAccessToken(payload: {
    userId: string;
    email: string;
    role: string;
  }) {
    return sign(
      {
        sub: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] },
    );
  }

  private async generateRefreshToken(sessionId: string) {
    const rawToken = crypto.randomBytes(64).toString("hex");
    const hashedToken = this.hashToken(rawToken);

    await prisma.refreshToken.create({
      data: {
        sessionId,
        tokenHash: hashedToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return rawToken;
  }

  private async generateTokens(payload: {
    userId: string;
    email: string;
    role: string;
  }) {
    const rawRefresh = crypto.randomBytes(64).toString("hex");
    const hashedRefresh = this.hashToken(rawRefresh);

    await prisma.session.create({
      data: {
        userId: payload.userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        refreshTokens: {
          create: {
            tokenHash: hashedRefresh,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: rawRefresh,
    };
  }
}
