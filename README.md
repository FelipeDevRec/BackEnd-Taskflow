# TaskFlow — Backend API

API REST completa para o TaskFlow, construída com **Node.js + Express + PostgreSQL + Prisma**.

---

## Stack

| Tecnologia | Função |
|---|---|
| Node.js ≥ 18 | Runtime |
| Express.js | Framework HTTP |
| PostgreSQL | Banco de dados |
| Prisma ORM | Acesso ao banco + migrações |
| JWT | Autenticação stateless |
| bcryptjs | Hash seguro de senhas |
| helmet | Segurança de headers HTTP |
| cors | Controle de origem cruzada |
| express-rate-limit | Proteção contra abuso |
| express-validator | Validação de entrada |
| dotenv | Variáveis de ambiente |

---

## Estrutura do projeto

```
taskflow-backend/
├── prisma/
│   ├── schema.prisma       # Modelos User e Task
│   └── seed.js             # Dados iniciais de exemplo
├── src/
│   ├── controllers/
│   │   ├── authController.js   # register, login, me
│   │   └── taskController.js   # CRUD completo de tarefas
│   ├── middleware/
│   │   ├── auth.js             # Middleware JWT
│   │   ├── validate.js         # Middleware de validação
│   │   └── errorHandler.js     # Handler global de erros
│   ├── routes/
│   │   ├── auth.js             # POST /register, POST /login, GET /me
│   │   └── tasks.js            # CRUD /tasks
│   ├── utils/
│   │   ├── jwt.js              # generateToken / verifyToken
│   │   ├── prisma.js           # Singleton do Prisma Client
│   │   └── response.js         # Helpers success() / error()
│   ├── app.js                  # Configuração do Express
│   └── server.js               # Entry point
├── .env.example
├── .gitignore
└── package.json
```

---

## Setup local

### Pré-requisitos

- Node.js ≥ 18
- PostgreSQL rodando localmente (ou via Docker)

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com seus dados reais. O campo mais importante é `DATABASE_URL`:

```
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/taskflow"
```

Para gerar um `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Criar o banco de dados

```bash
# Se estiver usando psql
psql -U postgres -c "CREATE DATABASE taskflow;"
```

### 4. Rodar as migrações

```bash
npm run db:migrate
# Quando solicitado, dê um nome para a migration, ex: "init"
```

Isso cria as tabelas `users` e `tasks` no PostgreSQL.

### 5. Gerar o Prisma Client

```bash
npm run db:generate
```

> **Nota:** `db:migrate` geralmente já roda o generate automaticamente.
> Execute este passo separadamente apenas se necessário.

### 6. (Opcional) Popular o banco com dados de exemplo

```bash
npm run db:seed
```

Cria o usuário `demo@taskflow.com` / `senha123` com 4 tarefas de exemplo.

### 7. Iniciar o servidor

```bash
# Desenvolvimento (hot-reload com nodemon)
npm run dev

# Produção
npm start
```

A API estará disponível em `http://localhost:3000`.

---

## Endpoints

### Health Check

```
GET /health
```

Retorna status do servidor.

---

### Autenticação

#### Cadastro

```
POST /api/auth/register
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "minhasenha123"
}
```

**Resposta (201):**
```json
{
  "success": true,
  "message": "Conta criada com sucesso.",
  "data": {
    "user": { "id": "...", "name": "João Silva", "email": "joao@exemplo.com" },
    "token": "eyJhbGci..."
  }
}
```

---

#### Login

```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "joao@exemplo.com",
  "password": "minhasenha123"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso.",
  "data": {
    "user": { "id": "...", "name": "João Silva", "email": "joao@exemplo.com" },
    "token": "eyJhbGci..."
  }
}
```

---

#### Dados do usuário autenticado

```
GET /api/auth/me
Authorization: Bearer <token>
```

---

### Tarefas

> Todas as rotas de tarefas exigem o header `Authorization: Bearer <token>`.

#### Listar tarefas

```
GET /api/tasks
GET /api/tasks?status=active
GET /api/tasks?status=completed
GET /api/tasks?status=all
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "tasks": [ ... ],
    "meta": { "total": 10, "completed": 3, "active": 7 }
  }
}
```

---

#### Criar tarefa

```
POST /api/tasks
```

**Body:**
```json
{ "title": "Minha nova tarefa" }
```

---

#### Atualizar tarefa

```
PUT /api/tasks/:id
```

**Body (campos opcionais):**
```json
{
  "title": "Título atualizado",
  "completed": true
}
```

---

#### Alternar status (pendente ↔ concluída)

```
PATCH /api/tasks/:id/toggle
```

---

#### Excluir tarefa

```
DELETE /api/tasks/:id
```

---

## Como integrar com o frontend

### 1. Salvar o token após login/registro

```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();

if (data.success) {
  localStorage.setItem('taskflow_token', data.data.token);
  localStorage.setItem('taskflow_user', JSON.stringify(data.data.user));
}
```

### 2. Usar o token nas requisições autenticadas

```javascript
const token = localStorage.getItem('taskflow_token');

const response = await fetch('http://localhost:3000/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. Logout

```javascript
localStorage.removeItem('taskflow_token');
localStorage.removeItem('taskflow_user');
window.location.href = '/login.html';
```

---

## Segurança implementada

| Proteção | Como |
|---|---|
| Senhas hasheadas | bcryptjs com 12 rounds de salt |
| Autenticação stateless | JWT com expiração configurável |
| Headers HTTP seguros | helmet |
| Rate limiting global | 100 req / 15 min por IP |
| Rate limiting de auth | 10 req / 15 min por IP |
| Validação de entrada | express-validator em todos os endpoints |
| CORS restrito | Apenas origens configuradas no .env |
| Isolamento de dados | Cada usuário acessa apenas suas próprias tarefas |
| Graceful shutdown | Fecha conexões do Prisma ao encerrar |

---

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia em modo desenvolvimento com hot-reload |
| `npm start` | Inicia em modo produção |
| `npm run db:migrate` | Cria/atualiza tabelas no banco (dev) |
| `npm run db:migrate:prod` | Aplica migrações em produção |
| `npm run db:generate` | Regenera o Prisma Client |
| `npm run db:studio` | Abre o Prisma Studio (interface visual do banco) |
| `npm run db:seed` | Popula o banco com dados de exemplo |
