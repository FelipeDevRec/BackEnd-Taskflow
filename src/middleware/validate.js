const { validationResult } = require("express-validator");
const { error } = require("../utils/response");

/**
 * Middleware que verifica os erros do express-validator.
 * Deve ser usado DEPOIS dos validators de cada rota.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return error(res, "Dados inválidos na requisição.", 422, formattedErrors);
  }

  next();
};

module.exports = { validate };
