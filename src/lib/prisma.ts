import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "../config/env";
import { logger } from "./logger";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL, max: 5 });
export const prisma = new PrismaClient({ adapter });

const shutdown = async () => {
  logger.info("Shutting down — disconnecting Prisma...");
  await prisma.$disconnect();
  process.exit(0);
};

adapter
  .connect()
  .then(() => {
    logger.info("Successfully connected to the database.");
  })
  .catch((error) => {
    logger.error("Failed to connect to the database:", error);
    process.exit(1);
  });

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
