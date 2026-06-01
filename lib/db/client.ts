import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var cachedDb: PrismaClient | undefined;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaPg({
    connectionString,
    ssl: { rejectUnauthorized: true },
  });
  return new PrismaClient({ adapter });
}

const db: PrismaClient =
  process.env.NODE_ENV === "production"
    ? createPrismaClient()
    : (global.cachedDb ??= createPrismaClient());

export { db };
