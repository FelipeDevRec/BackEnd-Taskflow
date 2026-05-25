// src/controllers/taskController.js
const prisma = require("../utils/prisma");
const { success, error } = require("../utils/response");

// ── Listar tarefas ────────────────────────────────────────────────────────────
// GET /api/tasks?status=all|active|completed
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status = "all" } = req.query;

    // Monta o filtro de status
    let completedFilter = {};
    if (status === "active") completedFilter = { completed: false };
    else if (status === "completed") completedFilter = { completed: true };

    const tasks = await prisma.task.findMany({
      where: { userId, ...completedFilter },
      orderBy: { createdAt: "desc" },
    });

    // Estatísticas resumidas junto com a listagem
    const [total, completed, active] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, completed: true } }),
      prisma.task.count({ where: { userId, completed: false } }),
    ]);

    return success(res, {
      tasks,
      meta: { total, completed, active },
    });
  } catch (err) {
    next(err);
  }
};

// ── Criar tarefa ──────────────────────────────────────────────────────────────
// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    const task = await prisma.task.create({
      data: { title: title.trim(), userId },
    });

    return success(res, { task }, "Tarefa criada com sucesso.", 201);
  } catch (err) {
    next(err);
  }
};

// ── Atualizar tarefa ──────────────────────────────────────────────────────────
// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, completed } = req.body;

    // Verifica se a tarefa existe e pertence ao usuário
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      return error(res, "Tarefa não encontrada.", 404);
    }

    // Monta os campos a atualizar (apenas os enviados)
    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (completed !== undefined) dataToUpdate.completed = completed;

    const task = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
    });

    return success(res, { task }, "Tarefa atualizada com sucesso.");
  } catch (err) {
    next(err);
  }
};

// ── Alternar status (concluída ↔ pendente) ────────────────────────────────────
// PATCH /api/tasks/:id/toggle
const toggleTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      return error(res, "Tarefa não encontrada.", 404);
    }

    const task = await prisma.task.update({
      where: { id },
      data: { completed: !existing.completed },
    });

    const msg = task.completed
      ? "Tarefa marcada como concluída."
      : "Tarefa marcada como pendente.";

    return success(res, { task }, msg);
  } catch (err) {
    next(err);
  }
};

// ── Excluir tarefa ────────────────────────────────────────────────────────────
// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      return error(res, "Tarefa não encontrada.", 404);
    }

    await prisma.task.delete({ where: { id } });

    return success(res, null, "Tarefa excluída com sucesso.");
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, toggleTask, deleteTask };
