const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const healthRoutes = require("./routes/healthRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Digital Logics Studio backend is running."
  });
});

app.use("/api/health", healthRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

module.exports = app;
