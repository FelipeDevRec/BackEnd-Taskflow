// src/utils/prisma.js
const { PrismaClient } = require("@prisma/client");
// Adapter for PostgreSQL (Prisma v7+ requires an adapter for direct DB connections)
let adapter;
try {
  const { PrismaPg } = require("@prisma/adapter-pg");
  adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
} catch (e) {
  // adapter package might not be installed yet; PrismaClient will throw a helpful error.
}

// Singleton para evitar múltiplas conexões em desenvolvimento (hot-reload)
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
