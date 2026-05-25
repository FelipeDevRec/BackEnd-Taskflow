// src/server.js
require("dotenv").config();

const app = require("./app");
const prisma = require("./utils/prisma");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} recebido. Encerrando servidor...`);
  await prisma.$disconnect();
  console.log("✅ Conexão com o banco encerrada.");
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ── Erros não capturados ──────────────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// ── Inicialização ─────────────────────────────────────────────────────────────
const start = async () => {
  try {
    // Testa a conexão com o banco antes de subir o servidor
    await prisma.$connect();
    console.log("✅ Conectado ao PostgreSQL via Prisma.");

    app.listen(PORT, () => {
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`🚀 TaskFlow API rodando`);
      console.log(`   Porta:       ${PORT}`);
      console.log(`   Ambiente:    ${NODE_ENV}`);
      console.log(`   Health:      http://localhost:${PORT}/health`);
      console.log(`   Auth:        http://localhost:${PORT}/api/auth`);
      console.log(`   Tasks:       http://localhost:${PORT}/api/tasks`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    });
  } catch (err) {
    console.error("❌ Falha ao iniciar o servidor:", err);
    process.exit(1);
  }
};

start();
