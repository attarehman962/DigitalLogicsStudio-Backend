const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  completeProblem,
  uncompleteProblem,
  recordAttempt,
  openTopic,
  toggleSubtopic,
  getSnapshot,
} = require("../controllers/progressController");

const router = express.Router();

// All progress routes require authentication
router.use(protect);

// ─── Snapshot (used to hydrate frontend on load) ─────────────────────────────
router.get("/snapshot", getSnapshot);

// ─── Problem progress ─────────────────────────────────────────────────────────
router.post("/problems/:problemId/attempt", recordAttempt);
router.post("/problems/:problemId/complete", completeProblem);
router.post("/problems/:problemId/uncomplete", uncompleteProblem);

// ─── Topic progress ───────────────────────────────────────────────────────────
router.post("/topics/:topicId/open", openTopic);
router.post("/topics/:topicId/subtopics/:subtopicId", toggleSubtopic);

module.exports = router;
