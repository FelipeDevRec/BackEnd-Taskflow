const { verifyToken } = require("../utils/jwt");
const { error } = require("../utils/response");
const db = require("../utils/db");

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

    const decoded = verifyToken(token);

    const user = await db.getUserById(decoded.id);

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
