const express = require("express");
const db = require("../config/db");
const authenticate = require("../middleware/auth");

const router = express.Router();

// CREATE CATEGORY
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Nama kategori wajib diisi"
      });
    }

    const [existingCategory] = await db.execute(
      "SELECT id FROM categories WHERE name = ?",
      [name]
    );

    if (existingCategory.length > 0) {
      return res.status(409).json({
        message: "Kategori sudah ada"
      });
    }

    const [result] = await db.execute(
      `INSERT INTO categories (name, description)
       VALUES (?, ?)`,
      [name, description || null]
    );

    res.status(201).json({
      message: "Kategori berhasil dibuat",
      category: {
        id: result.insertId,
        name,
        description: description || null
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

// GET ALL CATEGORIES
router.get("/", authenticate, async (req, res) => {
  try {
    const [categories] = await db.execute(
      `SELECT id, name, description, created_at
       FROM categories
       ORDER BY name ASC`
    );

    res.json({
      categories
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

// UPDATE CATEGORY
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Nama kategori wajib diisi"
      });
    }

    const [result] = await db.execute(
      `UPDATE categories
       SET name = ?, description = ?
       WHERE id = ?`,
      [name, description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan"
      });
    }

    res.json({
      message: "Kategori berhasil diperbarui"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

// DELETE CATEGORY
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "DELETE FROM categories WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan"
      });
    }

    res.json({
      message: "Kategori berhasil dihapus"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

module.exports = router;