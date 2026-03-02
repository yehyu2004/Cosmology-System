import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "";
  const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
  const opts: ConstructorParameters<typeof PrismaClient>[0] = {
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  };
  if (!isLocal) {
    opts.adapter = new PrismaNeon({ connectionString: url });
  }
  return new PrismaClient(opts);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
