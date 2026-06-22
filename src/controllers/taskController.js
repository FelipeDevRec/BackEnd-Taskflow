const db = require("../utils/db");
const { success, error } = require("../utils/response");


const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status = "all" } = req.query;

    const tasks = await db.getTasks(userId, status);

    const [total, completed, active] = await Promise.all([
      db.countTasks(userId),
      db.countTasks(userId, true),
      db.countTasks(userId, false),
    ]);

    return success(res, {
      tasks,
      meta: { total, completed, active },
    });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    const task = await db.createTask(userId, title);

    return success(res, { task }, "Tarefa criada com sucesso.", 201);
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, completed } = req.body;

    const existing = await db.findTaskByIdAndUser(id, userId);
    if (!existing) {
      return error(res, "Tarefa não encontrada.", 404);
    }

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (completed !== undefined) dataToUpdate.completed = completed;

    const task = await db.updateTask(id, dataToUpdate);

    return success(res, { task }, "Tarefa atualizada com sucesso.");
  } catch (err) {
    next(err);
  }
};

const toggleTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await db.findTaskByIdAndUser(id, userId);
    if (!existing) {
      return error(res, "Tarefa não encontrada.", 404);
    }

    const task = await db.updateTask(id, {
      completed: !existing.completed,
    });

    const msg = task.completed
      ? "Tarefa marcada como concluída."
      : "Tarefa marcada como pendente.";

    return success(res, { task }, msg);
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await db.findTaskByIdAndUser(id, userId);
    if (!existing) {
      return error(res, "Tarefa não encontrada.", 404);
    }

    await db.deleteTask(id);

    return success(res, null, "Tarefa excluída com sucesso.");
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, toggleTask, deleteTask };
