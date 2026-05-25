// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Remove dados existentes (ordem importa por causa das foreign keys)
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("senha123", 12);

  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@taskflow.com",
      password: hashedPassword,
      tasks: {
        create: [
          { title: "Configurar o ambiente de desenvolvimento" },
          { title: "Integrar frontend com a nova API", completed: false },
          { title: "Revisar documentação do Prisma", completed: true },
          { title: "Escrever testes de integração" },
        ],
      },
    },
  });

  console.log(`✅ Usuário demo criado: ${user.email}`);
  console.log("✅ Tarefas de exemplo criadas.");
  console.log("\n🔑 Credenciais do demo:");
  console.log("   Email:  demo@taskflow.com");
  console.log("   Senha:  senha123");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
