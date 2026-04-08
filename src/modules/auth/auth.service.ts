import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { DUMMY_HASH, PRISMA_CODES } from "../../constants";
import { TOKEN_EXPIRY } from "../../constants/auth";
import { hashPassword, verifyPassword } from "../../lib/argon";
import { hashString, randomString } from "../../lib/crypto";
import { signJwt } from "../../lib/jwt";
import { prisma } from "../../lib/prisma";
import {
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
} from "../../utils/errors";
import { LoginDto, RegisterDto } from "./auth.schema";
import { DeviceInfo } from "./auth.types";

export class AuthService {
  constructor() {}

  private calculateExpiry(ms: number) {
    return new Date(Date.now() + ms);
  }

  private async createSession(userId: string, deviceInfo: DeviceInfo) {
    const token = randomString(64);
    const tokenHash = hashString(token);

    await prisma.session.create({
      data: {
        userId,
        expiresAt: this.calculateExpiry(TOKEN_EXPIRY.SESSION_MS),
        ...deviceInfo,
        refreshToken: {
          create: {
            tokenHash,
            expiresAt: this.calculateExpiry(TOKEN_EXPIRY.REFRESH_TOKEN_MS),
          },
        },
      },
    });
    return token;
  }

  private async createRefreshToken(sessionId: string) {
    const token = randomString(64);
    const tokenHash = hashString(token);
    await prisma.refreshToken.create({
      data: {
        tokenHash,
        expiresAt: this.calculateExpiry(TOKEN_EXPIRY.REFRESH_TOKEN_MS),
        sessionId,
      },
    });
    return token;
  }

  async register(data: RegisterDto) {
    try {
      const hashedPassword = await hashPassword(data.password);
      return await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === PRISMA_CODES.CONFLICT
      ) {
        throw new ConflictException(
          `${data.email} already exists. Use another email.`,
        );
      }
      throw new InternalServerErrorException();
    }
  }

  async login(data: LoginDto, deviceInfo: DeviceInfo) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    const passwordHash = user?.passwordHash ?? DUMMY_HASH;
    const isPasswordValid = await verifyPassword(passwordHash, data.password);

    if (!user || !isPasswordValid) {
      throw new ForbiddenException("Invalid credentials");
    }

    const refreshToken = await this.createSession(user.id, deviceInfo);
    const accessToken = signJwt({ sub: user.id });

    return { refreshToken, accessToken };
  }

  async logout(token: string) {
    try {
      const tokenHash = hashString(token);
      const refreshToken = await prisma.refreshToken.delete({
        where: { tokenHash, expiresAt: { gt: new Date() } },
        include: {
          session: true,
        },
      });
      if (!refreshToken) {
        throw new ForbiddenException("Invalid or expired token");
      }

      await prisma.session.delete({
        where: { id: refreshToken.sessionId },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === PRISMA_CODES.NOT_FOUND
      ) {
        throw new ForbiddenException("Invalid or expired token");
      }
      throw new InternalServerErrorException();
    }
  }

  async refresh(token: string) {
    const tokenHash = hashString(token);

    return await prisma.$transaction(async (tx) => {
      const existing = await tx.refreshToken.findUnique({
        where: { tokenHash },
        include: { session: true },
      });

      if (!existing || existing.expiresAt <= new Date()) {
        // Potential token reuse — invalidate the entire session
        if (existing) {
          await tx.session.delete({ where: { id: existing.sessionId } });
        }
        throw new ForbiddenException("Invalid or expired token");
      }

      await tx.refreshToken.delete({ where: { id: existing.id } });

      const newToken = randomString(64);
      const newTokenHash = hashString(newToken);
      await tx.refreshToken.create({
        data: {
          tokenHash: newTokenHash,
          expiresAt: this.calculateExpiry(TOKEN_EXPIRY.REFRESH_TOKEN_MS),
          sessionId: existing.sessionId,
        },
      });

      return {
        accessToken: signJwt({ sub: existing.session.userId }),
        refreshToken: newToken,
      };
    });
  }
}
