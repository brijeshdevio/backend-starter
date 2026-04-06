import { prisma } from "../../lib/prisma";

export class SessionService {
  constructor() {}

  async findAll(id: string) {
    const sessions = await prisma.session.findMany({
      where: {
        userId: id,
      },
      select: {
        id: true,
        type: true,
        deviceName: true,
        ipAddress: true,
        userAgent: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    return sessions;
  }
}
