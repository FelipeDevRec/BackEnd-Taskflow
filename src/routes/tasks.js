// src/routes/tasks.js
const { Router } = require("express");
const { body, param, query } = require("express-validator");
const {
  getTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
} = require("../controllers/taskController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = Router();

// Todas as rotas de tarefas exigem autenticação
router.use(authenticate);

// ── Validators ───────────────────────────────────────────────────────────────

const idValidator = [
  param("id").notEmpty().withMessage("ID da tarefa é obrigatório."),
];

const createValidators = [
  body("title")
    .trim()
    .notEmpty().withMessage("O título da tarefa é obrigatório.")
    .isLength({ min: 1, max: 255 }).withMessage("O título deve ter no máximo 255 caracteres."),
];

const updateValidators = [
  ...idValidator,
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("O título não pode ser vazio.")
    .isLength({ max: 255 }).withMessage("O título deve ter no máximo 255 caracteres."),
  body("completed")
    .optional()
    .isBoolean().withMessage("O campo 'completed' deve ser verdadeiro ou falso."),
];

const statusQueryValidator = [
  query("status")
    .optional()
    .isIn(["all", "active", "completed"])
    .withMessage("Status inválido. Use: all, active ou completed."),
];

// ── Rotas ────────────────────────────────────────────────────────────────────

// GET /api/tasks?status=all|active|completed
router.get("/", statusQueryValidator, validate, getTasks);

// POST /api/tasks
router.post("/", createValidators, validate, createTask);

// PUT /api/tasks/:id
router.put("/:id", updateValidators, validate, updateTask);

// PATCH /api/tasks/:id/toggle
router.patch("/:id/toggle", idValidator, validate, toggleTask);

// DELETE /api/tasks/:id
router.delete("/:id", idValidator, validate, deleteTask);

module.exports = router;
