/**
 * Retorna uma resposta de sucesso padronizada.
 */
const success = (res, data = null, message = "Operação realizada com sucesso", statusCode = 200) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

/**
 * Retorna uma resposta de erro padronizada.
 */
const error = (res, message = "Erro interno do servidor", statusCode = 500, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

module.exports = { success, error };
