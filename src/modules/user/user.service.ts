import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { DUMMY_HASH, PRISMA_CODES } from "../../constants";
import { hashPassword, verifyPassword } from "../../lib/argon";
import { prisma } from "../../lib/prisma";
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "../../utils/errors";
import { ChangePasswordDto, UpdateDto } from "./user.schema";

export class UserService {
  constructor() {}

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async update(id: string, data: UpdateDto) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { name: data.name },
        select: {
          id: true,
          name: true,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === PRISMA_CODES.NOT_FOUND
      ) {
        throw new NotFoundException("User not found");
      }
      throw error;
    }
  }

  async changePassword(id: string, data: ChangePasswordDto) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const passwordHash = user.passwordHash ?? DUMMY_HASH;
    const isPasswordValid = await verifyPassword(
      passwordHash,
      data.oldPassword,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException("Invalid old password.");
    }

    // Atomically update password and invalidate all sessions
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: {
          passwordHash: await hashPassword(data.newPassword),
        },
      }),
      prisma.session.deleteMany({ where: { userId: id } }),
    ]);
  }
}
