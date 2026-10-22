const express = require("express");
const db = require("../config/db");
const authenticate = require("../middleware/auth");

const router = express.Router();

// GET PROGRESS & STATISTICS
router.get("/", authenticate, async (req, res) => {
  try {
    const [habitCount] = await db.execute(
      `SELECT COUNT(*) AS total_habits
       FROM habits
       WHERE user_id = ?`,
      [req.user.id]
    );

    const [logStats] = await db.execute(
      `SELECT
        COUNT(*) AS total_logs,
        SUM(CASE WHEN hl.status = 'completed' THEN 1 ELSE 0 END) AS completed_logs,
        SUM(CASE WHEN hl.status = 'skipped' THEN 1 ELSE 0 END) AS skipped_logs
       FROM habit_logs hl
       JOIN habits h ON hl.habit_id = h.id
       WHERE h.user_id = ?`,
      [req.user.id]
    );

    const totalLogs = Number(logStats[0].total_logs) || 0;
    const completedLogs = Number(logStats[0].completed_logs) || 0;

    const completionRate =
      totalLogs > 0
        ? Number(((completedLogs / totalLogs) * 100).toFixed(2))
        : 0;

    res.json({
      statistics: {
        total_habits: Number(habitCount[0].total_habits),
        total_logs: totalLogs,
        completed_logs: completedLogs,
        skipped_logs: Number(logStats[0].skipped_logs) || 0,
        completion_rate: completionRate
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

module.exports = router;
