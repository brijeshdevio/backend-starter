import { prisma } from "../../lib/prisma";
import { FindUsersQueryDto } from "./users.schema";

export class UsersService {
  constructor() {}

  async findAllUsers(userId: string, query: FindUsersQueryDto) {
    query.page = query.page || 1;
    query.limit = query.limit || 10;
    const where: Record<string, unknown> = {
      id: { not: userId },
    };
    if (query.role) {
      where.role = query.role;
    }
    if (query.search) {
      where.name = {
        contains: query.search,
        mode: "insensitive",
      };
    }
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const users = await prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    const total = await prisma.user.count({ where, skip, take });

    return {
      users,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
