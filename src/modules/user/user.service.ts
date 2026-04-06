import { DUMMY_HASH } from "../../constants";
import { hashPassword, verifyPassword } from "../../lib/argon";
import { prisma } from "../../lib/prisma";
import { ForbiddenException, UnauthorizedException } from "../../utils/errors";
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
    if (user) return user;

    throw new UnauthorizedException();
  }

  async update(id: string, data: UpdateDto) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
      },
      select: {
        id: true,
        name: true,
      },
    });
    if (user) return user;

    throw new UnauthorizedException();
  }

  async changePassword(id: string, data: ChangePasswordDto) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new ForbiddenException("You are not logged in.");
    }

    const passwordHash = user?.passwordHash ?? DUMMY_HASH;
    const isPasswordValid = await verifyPassword(
      passwordHash,
      data.oldPassword,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException("Invalid old password.");
    }

    await prisma.user.update({
      where: { id },
      data: {
        passwordHash: await hashPassword(data.newPassword),
      },
    });
  }
}
