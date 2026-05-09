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
  // Local development: start the server normally
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
  // Vercel serverless: just connect DB (no app.listen)
  validateEnvironment();
  connectDB().catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });
}

// Required for Vercel — export the app as the handler
module.exports = app;
