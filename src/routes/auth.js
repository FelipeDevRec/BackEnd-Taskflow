const { Router } = require("express");
const { body } = require("express-validator");
const { register, login, me } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = Router();

// ── Validators ───────────────────────────────────────────────────────────────

const registerValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("O nome é obrigatório.")
    .isLength({ min: 2, max: 100 }).withMessage("O nome deve ter entre 2 e 100 caracteres."),

  body("email")
    .trim()
    .notEmpty().withMessage("O e-mail é obrigatório.")
    .isEmail().withMessage("Informe um e-mail válido.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("A senha é obrigatória.")
    .isLength({ min: 6 }).withMessage("A senha deve ter pelo menos 6 caracteres.")
    .isLength({ max: 128 }).withMessage("A senha deve ter no máximo 128 caracteres."),
];

const loginValidators = [
  body("email")
    .trim()
    .notEmpty().withMessage("O e-mail é obrigatório.")
    .isEmail().withMessage("Informe um e-mail válido.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("A senha é obrigatória."),
];

// ── Rotas ────────────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post("/register", registerValidators, validate, register);

// POST /api/auth/login
router.post("/login", loginValidators, validate, login);

// GET /api/auth/me  (rota protegida)
router.get("/me", authenticate, me);

module.exports = router;
