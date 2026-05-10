const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const progressRoutes = require("./routes/progressRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// ─── CORS ───────────────────────────────────────────────────────────────────
// FIX 1: Allow both local dev AND deployed Vercel frontend origin.
//         Also read CLIENT_URL from env so you only need to update .env on
//         Vercel, not redeploy code, when the frontend domain changes.
const allowedOrigins = [
  "http://localhost:3000",
  "https://circuits.quantumlogicslimited.com",
  // Dynamically include whatever CLIENT_URL is set to in the environment
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
  // Allow Vercel preview deployments (*.vercel.app) — remove if not needed
  ...(process.env.VERCEL_ENV === "preview"
    ? [/https:\/\/.*\.vercel\.app$/]
    : []),
];

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // Check string origins
      const stringMatch = allowedOrigins
        .filter((o) => typeof o === "string")
        .includes(origin);

      // Check regex origins (e.g. Vercel preview wildcard)
      const regexMatch = allowedOrigins
        .filter((o) => o instanceof RegExp)
        .some((re) => re.test(origin));

      if (stringMatch || regexMatch) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy blocked origin: ${origin}`));
      }
    },
    credentials: true, // Required for httpOnly cookie to be sent cross-origin
  }),
);
// ─────────────────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Swagger UI ──────────────────────────────────────────────────────────────
// FIX 2: Swagger was disabled in production.  Enable it always so you can
//         verify routes are live on Vercel via /api/docs.
//         If you truly want production-only restriction, flip the condition back.
{
  const swaggerUi = require("swagger-ui-express");
  const swaggerSpec = require("./config/swagger");

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "Digital Logics Studio — API Docs",
      swaggerOptions: {
        withCredentials: true,
      },
    }),
  );

  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}
// ─────────────────────────────────────────────────────────────────────────────

// Root health ping (Vercel checks this on deploy)
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Digital Logics Studio backend is running.",
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
// ─────────────────────────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

module.exports = app;
