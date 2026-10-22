const express = require("express");
const db = require("../config/db");
const authenticate = require("../middleware/auth");

const router = express.Router();

// =========================
// CREATE HABIT LOG
// =========================

router.post("/", authenticate, async (req, res) => {
  try {
    const { habit_id, log_date, status } = req.body;

    if (!habit_id || !log_date || !status) {
      return res.status(400).json({
        message: "Habit, tanggal, dan status wajib diisi"
      });
    }

    if (!["completed", "skipped"].includes(status)) {
      return res.status(400).json({
        message: "Status harus completed atau skipped"
      });
    }

    const [habit] = await db.execute(
      `SELECT id
       FROM habits
       WHERE id = ? AND user_id = ?`,
      [habit_id, req.user.id]
    );

    if (habit.length === 0) {
      return res.status(404).json({
        message: "Habit tidak ditemukan"
      });
    }

    const [existingLog] = await db.execute(
      `SELECT id
       FROM habit_logs
       WHERE habit_id = ? AND log_date = ?`,
      [habit_id, log_date]
    );

    if (existingLog.length > 0) {
      return res.status(409).json({
        message: "Habit untuk tanggal tersebut sudah dicatat"
      });
    }

    const [result] = await db.execute(
      `INSERT INTO habit_logs
       (habit_id, log_date, status)
       VALUES (?, ?, ?)`,
      [habit_id, log_date, status]
    );

    res.status(201).json({
      message: "Habit berhasil dicatat",
      log: {
        id: result.insertId,
        habit_id,
        log_date,
        status
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});


// =========================
// GET ALL HABIT LOGS
// =========================

router.get("/", authenticate, async (req, res) => {
  try {
    const [logs] = await db.execute(
      `SELECT
        hl.id,
        hl.habit_id,
        h.name AS habit_name,
        h.description AS habit_description,
        DATE_FORMAT(hl.log_date, '%Y-%m-%d') AS log_date,
        hl.status,
        hl.created_at
      FROM habit_logs hl
      JOIN habits h
        ON hl.habit_id = h.id
      WHERE h.user_id = ?
      ORDER BY hl.log_date DESC`,
      [req.user.id]
    );

    res.json({
      logs
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});


// =========================
// UPDATE HABIT LOG
// =========================

router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status wajib diisi"
      });
    }

    if (!["completed", "skipped"].includes(status)) {
      return res.status(400).json({
        message: "Status harus completed atau skipped"
      });
    }

    const [result] = await db.execute(
      `UPDATE habit_logs hl
       JOIN habits h
         ON hl.habit_id = h.id
       SET hl.status = ?
       WHERE hl.id = ?
         AND h.user_id = ?`,
      [status, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Habit log tidak ditemukan"
      });
    }

    res.json({
      message: "Habit log berhasil diperbarui"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});


// =========================
// DELETE HABIT LOG
// =========================

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      `DELETE hl
       FROM habit_logs hl
       JOIN habits h
         ON hl.habit_id = h.id
       WHERE hl.id = ?
         AND h.user_id = ?`,
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Habit log tidak ditemukan"
      });
    }

    res.json({
      message: "Habit log berhasil dihapus"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});


module.exports = router;