require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const { errorHandler, notFound } = require("./middleware/errorHandler");
// Swagger
const swaggerUi = require("swagger-ui-express");
let openapiDocument;
try {
  openapiDocument = require("./docs/openapi.json");
} catch (err) {
  console.error('Warning: failed to load ./docs/openapi.json — serving minimal OpenAPI spec instead:', err.message);
  openapiDocument = {
    openapi: "3.0.3",
    info: { title: "TaskFlow API", version: "1.0.0" },
    paths: { "/health": { get: { responses: { "200": { description: "OK" } } } } }
  };
}

const app = express();

// ── Segurança: Headers HTTP ───────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5500")
      .split(",")
      .map((o) => o.trim());

    // Permite requisições sem origin (ex: mobile apps, Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origem não permitida — ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────

// Rate limit global
const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Muitas requisições. Tente novamente em alguns minutos.",
  },
});

// Rate limit mais restrito para autenticação
const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Muitas tentativas de autenticação. Tente novamente mais tarde.",
  },
});

app.use(globalLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── Rotas da API ──────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/tasks", taskRoutes);

// Swagger UI
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiDocument, { explorer: true })
);
app.get('/api/docs/json', (req, res) => res.json(openapiDocument));

// ── 404 e Tratamento Global de Erros ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
