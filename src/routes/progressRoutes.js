const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { completeProblem } = require("../controllers/progressController");

const router = express.Router();

router.post("/problems/:problemId/complete", protect, completeProblem);

module.exports = router;
