// scripts/seed.js
const bcrypt = require("bcryptjs");
const db = require("../src/utils/db");
const supabase = require("../src/utils/supabase");

const CREATE_TABLES_SQL = `-- Run these statements in the Supabase SQL editor (Project > SQL)
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  completed boolean DEFAULT false,
  "userId" text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);
`;

async function ensureTables() {
  if (!supabase) {
    throw new Error("Supabase client not configured. Set SUPABASE_SECRET_KEY and SUPABASE_URL in .env");
  }

  // Try a harmless select to detect whether the `users` table exists
  const { data, error } = await supabase.from("users").select("id").limit(1);
  if (error) {
    const msg = String(error.message || error);
    // common messages: "Could not find the table 'public.users'" or "relation \"users\" does not exist"
    if (msg.includes("Could not find") || msg.includes("does not exist") || msg.toLowerCase().includes("relation \"users\"")) {
      console.error("❌ Tabela 'users' não encontrada no projeto Supabase.");
      console.error("Copie e execute estas instruções SQL no editor SQL do Supabase para criar as tabelas necessárias:\n");
      console.error(CREATE_TABLES_SQL);
      process.exit(1);
    }
    // Unexpected error — rethrow
    throw error;
  }

  return true;
}

async function main() {
  console.log("🌱 Seeding database (Supabase)...");

  await ensureTables();

  // Remove dados existentes (ordem importa por causa das foreign keys)
  await db.deleteAllTasks();
  await db.deleteAllUsers();

  const hashedPassword = await bcrypt.hash("senha123", 12);

  const user = await db.createUser({
    name: "Demo User",
    email: "demo@taskflow.com",
    password: hashedPassword,
  });

  const tasks = [
    { title: "Configurar o ambiente de desenvolvimento" },
    { title: "Integrar frontend com a nova API", completed: false },
    { title: "Revisar documentação do Supabase", completed: true },
    { title: "Escrever testes de integração" },
  ];

  for (const task of tasks) {
    const createdTask = await db.createTask(user.id, task.title);
    if (task.completed) {
      await db.updateTask(createdTask.id, { completed: task.completed });
    }
  }

  console.log(`✅ Usuário demo criado: ${user.email}`);
  console.log("✅ Tarefas de exemplo criadas.");
  console.log("\n🔑 Credenciais do demo:");
  console.log("   Email:  demo@taskflow.com");
  console.log("   Senha:  senha123");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await db.disconnect();
  });
