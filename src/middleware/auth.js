// src/middleware/auth.js
const { verifyToken } = require("../utils/jwt");
const { error } = require("../utils/response");
const prisma = require("../utils/prisma");

/**
 * Middleware de autenticação via JWT Bearer Token.
 * Injeta `req.user` com os dados do usuário autenticado.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return error(res, "Token de autenticação não fornecido.", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return error(res, "Token de autenticação inválido.", 401);
    }

    // Decodifica e valida o token
    const decoded = verifyToken(token);

    // Busca o usuário no banco para garantir que ainda existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      return error(res, "Usuário não encontrado ou token inválido.", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return error(res, "Token expirado. Faça login novamente.", 401);
    }
    if (err.name === "JsonWebTokenError") {
      return error(res, "Token inválido.", 401);
    }
    console.error("[Auth Middleware Error]", err);
    return error(res, "Erro na autenticação.", 500);
  }
};

module.exports = { authenticate };
