require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const validateEnvironment = () => {
  const requiredVariables = ["MONGO_URI", "JWT_SECRET"];
  const missingVariables = requiredVariables.filter(
    (variableName) => !process.env[variableName],
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`,
    );
  }
};

if (process.env.NODE_ENV !== "production") {
  // Local development: start the HTTP server normally
  const startServer = async () => {
    try {
      validateEnvironment();
      await connectDB();
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error.message);
      process.exit(1);
    }
  };

  startServer();
} else {
  // ── Vercel serverless ────────────────────────────────────────────────────
  // FIX 3: In the original code the production branch called connectDB() but
  //         did NOT await it synchronously before exporting `app`.  On a cold
  //         start Vercel could receive the first request before Mongoose was
  //         connected, causing "MongoNotConnectedError" on every route.
  //
  //         The correct pattern is to connect lazily inside a wrapper that
  //         reuses an existing connection (Mongoose caches the connection on
  //         the module level) rather than calling connectDB() at the top level
  //         and hoping it resolves in time.
  //
  //         We export a thin async handler that ensures the DB is ready before
  //         passing the request to Express.

  validateEnvironment();

  let dbConnected = false;

  const handler = async (req, res) => {
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }
    // Delegate to the Express app
    app(req, res);
  };

  // Vercel expects module.exports to be the request handler
  module.exports = handler;

  // Early-exit so the module.exports below is NOT reached in production
  return; // eslint-disable-line no-unreachable
}

// Required for Vercel — export the app as the handler
// (Only reached in development; the production branch returns early above.)
module.exports = app;
