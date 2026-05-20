import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let prisma: PrismaClient | null = null;

export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
      }),
      log: ["error"],
    });
  }
  return prisma;
}

export const db = getPrisma();
