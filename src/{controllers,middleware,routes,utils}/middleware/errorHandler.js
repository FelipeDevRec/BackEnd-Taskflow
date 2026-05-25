// src/middleware/errorHandler.js

/**
 * Middleware global de tratamento de erros.
 * Deve ser registrado por ÚLTIMO no app.js, depois de todas as rotas.
 */
const errorHandler = (err, req, res, next) => {
  console.error("[Global Error Handler]", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Erros do Prisma
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Já existe um registro com esses dados.",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Registro não encontrado.",
    });
  }

  // Erro genérico — nunca expõe detalhes em produção
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Erro interno do servidor."
      : err.message || "Erro interno do servidor.";

  res.status(statusCode).json({ success: false, message });
};

/**
 * Handler para rotas não encontradas (404).
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.method} ${req.path}`,
  });
};

module.exports = { errorHandler, notFound };
