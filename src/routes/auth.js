const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const authenticate = require("../middleware/auth");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nama, email, dan password wajib diisi"
      });
    }

    const [existingUser] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: "Email sudah terdaftar"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );

    res.status(201).json({
      message: "Registrasi berhasil"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi"
      });
    }

    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Email atau password salah"
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email atau password salah"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

// GET PROFILE
router.get("/me", authenticate, async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan"
      });
    }

    res.json({
      user: users[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

// UPDATE PROFILE
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Nama dan email wajib diisi"
      });
    }

    const [existingUser] = await db.execute(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, req.user.id]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: "Email sudah digunakan"
      });
    }

    const [result] = await db.execute(
      `UPDATE users
       SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan"
      });
    }

    res.json({
      message: "Profil berhasil diperbarui"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server"
    });
  }
});

// LOGOUT
router.post("/logout", authenticate, (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "strict"
  });

  res.json({
    message: "Logout berhasil"
  });
});

module.exports = router;