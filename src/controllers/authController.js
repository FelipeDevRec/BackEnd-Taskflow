// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const db = require("../utils/db");
const { generateToken } = require("../utils/jwt");
const { success, error } = require("../utils/response");

const SALT_ROUNDS = 12;

// ── Cadastro ────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Verifica se o e-mail já está em uso
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return error(res, "Este e-mail já está em uso.", 409);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Cria o usuário
    const user = await db.createUser({
      name,
      email,
      password: hashedPassword,
    });

    // Gera o token imediatamente após o registro
    const token = generateToken({ id: user.id, email: user.email });

    return success(res, { user, token }, "Conta criada com sucesso.", 201);
  } catch (err) {
    next(err);
  }
};

// ── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Busca o usuário (inclui a senha para comparação)
    const user = await db.getUserByEmail(email);

    // Mesmo que o usuário não exista, faz o compare para evitar timing attacks
    const passwordMatch = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !passwordMatch) {
      return error(res, "E-mail ou senha incorretos.", 401);
    }

    // Gera o token
    const token = generateToken({ id: user.id, email: user.email });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return success(res, { user: userData, token }, "Login realizado com sucesso.");
  } catch (err) {
    next(err);
  }
};

// ── Dados do usuário autenticado ─────────────────────────────────────────────
const me = async (req, res) => {
  // req.user já foi populado pelo middleware authenticate
  return success(res, { user: req.user });
};

module.exports = { register, login, me };
