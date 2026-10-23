
const express = require("express");
const db = require("../config/db");
const authenticate = require("../middleware/auth");

const router = express.Router();

// GET PROGRESS KESELURUHAN
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

    const completionRate = totalLogs > 0
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
    console.error("Gagal memuat statistik:", error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

// GET PROGRESS BULANAN
router.get("/monthly", authenticate, async (req, res) => {
  try {
    const month = req.query.month;

    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({
        message: "Format bulan harus YYYY-MM"
      });
    }

    const [year, monthNumber] = month.split("-").map(Number);

    const startDate =
      `${month}-01`;

    const daysInMonth =
      new Date(year, monthNumber, 0).getDate();

    const endDate =
      `${month}-${String(daysInMonth).padStart(2, "0")}`;

    // Ambil habit aktif milik pengguna.
    const [habits] = await db.execute(
      `SELECT id, target, frequency
       FROM habits
       WHERE user_id = ?
         AND status = 'active'`,
      [req.user.id]
    );

    // Hitung log selesai pada bulan terpilih.
    const [logs] = await db.execute(
      `SELECT
         hl.habit_id,
         COUNT(*) AS completed_count
       FROM habit_logs hl
       JOIN habits h ON h.id = hl.habit_id
       WHERE h.user_id = ?
         AND h.status = 'active'
         AND hl.status = 'completed'
         AND hl.log_date >= ?
         AND hl.log_date <= ?
       GROUP BY hl.habit_id`,
      [req.user.id, startDate, endDate]
    );

    const completedByHabit = new Map(
      logs.map(log => [
        Number(log.habit_id),
        Number(log.completed_count)
      ])
    );

    // Hitung jumlah minggu kalender yang tersentuh bulan ini.
    const firstWeekday =
      new Date(year, monthNumber - 1, 1).getDay();

    const weeksInMonth =
      Math.ceil((firstWeekday + daysInMonth) / 7);

    let totalTarget = 0;
    let completedCount = 0;

    for (const habit of habits) {
      const target = Math.max(0, Number(habit.target) || 0);

      let monthlyTarget = 0;

      if (habit.frequency === "daily") {
        monthlyTarget = target * daysInMonth;
      } else if (habit.frequency === "weekly") {
        monthlyTarget = target * weeksInMonth;
      }

      totalTarget += monthlyTarget;

      completedCount += Math.min(
        completedByHabit.get(Number(habit.id)) || 0,
        monthlyTarget
      );
    }

    const progressRate = totalTarget > 0
      ? Number(
          Math.min(
            100,
            (completedCount / totalTarget) * 100
          ).toFixed(2)
        )
      : 0;

    res.json({
      monthly: {
        month,
        total_target: totalTarget,
        completed_count: completedCount,
        remaining_target: Math.max(
          0,
          totalTarget - completedCount
        ),
        progress_rate: progressRate
      }
    });
  } catch (error) {
    console.error("Gagal memuat progress bulanan:", error);

    res.status(500).json({
      message: "Gagal memuat progress bulanan"
    });
  }
});

module.exports = router;
