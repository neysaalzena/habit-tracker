const express = require("express");
const db = require("../config/db");
const authenticate = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

// GET ALL USERS
router.get("/users", authenticate, admin, async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT
        id,
        name,
        email,
        role,
        created_at,
        updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({
      users
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

// UPDATE USER ROLE
router.put("/users/:id/role", authenticate, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Role harus berupa user atau admin"
      });
    }

    const [result] = await db.execute(
      `UPDATE users
       SET role = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan"
      });
    }

    res.json({
      message: "Role user berhasil diperbarui"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

// DELETE USER
router.delete("/users/:id", authenticate, admin, async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({
        message: "Admin tidak dapat menghapus akun sendiri"
      });
    }

    const [result] = await db.execute(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan"
      });
    }

    res.json({
      message: "User berhasil dihapus"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

module.exports = router;