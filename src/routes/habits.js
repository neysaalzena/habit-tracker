const express = require("express");
const db = require("../config/db");
const authenticate = require("../middleware/auth");

const router = express.Router();

// CREATE HABIT
router.post("/", authenticate, async (req, res) => {
  try {
    const {
      name,
      description,
      category_id,
      target,
      frequency
    } = req.body;

    if (!name || !target || !frequency) {
      return res.status(400).json({
        message: "Nama, target, dan frekuensi wajib diisi"
      });
    }

    const [result] = await db.execute(
      `INSERT INTO habits
      (user_id, category_id, name, description, target, frequency, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [
        req.user.id,
        category_id || null,
        name,
        description || null,
        target,
        frequency
      ]
    );

    res.status(201).json({
      message: "Habit berhasil dibuat",
      habit: {
        id: result.insertId,
        name,
        description: description || null,
        category_id: category_id || null,
        target,
        frequency,
        status: "active"
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

// GET ALL HABITS
router.get("/", authenticate, async (req, res) => {
  try {
    const [habits] = await db.execute(
      `SELECT
        h.id,
        h.name,
        h.description,
        h.category_id,
        h.target,
        h.frequency,
        h.status,
        h.created_at,
        h.updated_at
      FROM habits h
      WHERE h.user_id = ?
      ORDER BY h.created_at DESC`,
      [req.user.id]
    );

    res.json({
      habits
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

// UPDATE HABIT
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      category_id,
      target,
      frequency,
      status
    } = req.body;

    if (!name || !target || !frequency || !status) {
      return res.status(400).json({
        message: "Nama, target, frekuensi, dan status wajib diisi"
      });
    }

    const [result] = await db.execute(
      `UPDATE habits
       SET name = ?,
           description = ?,
           category_id = ?,
           target = ?,
           frequency = ?,
           status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        name,
        description || null,
        category_id || null,
        target,
        frequency,
        status,
        id,
        req.user.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Habit tidak ditemukan"
      });
    }

    res.json({
      message: "Habit berhasil diperbarui"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

// DELETE HABIT
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      `DELETE FROM habits
       WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Habit tidak ditemukan"
      });
    }

    res.json({
      message: "Habit berhasil dihapus"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

module.exports = router;