// src/utils/prisma.js
const { PrismaClient } = require("@prisma/client");

// Singleton para evitar múltiplas conexões em desenvolvimento (hot-reload)
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
