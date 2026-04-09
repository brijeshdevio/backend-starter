import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "../config/env";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL, max: 5 });
export const prisma = new PrismaClient({ adapter });

// Graceful shutdown — prevent connection pool leaks
const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
