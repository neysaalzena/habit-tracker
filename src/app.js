const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/auth");
const habitRoutes = require("./routes/habits");
const habitLogRoutes = require("./routes/habitLogs");
const categoryRoutes = require("./routes/categories");
const progressRoutes = require("./routes/progress");
const adminRoutes = require("./routes/admin");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// =========================
// API ROUTES
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/habit-logs", habitLogRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);

// =========================
// FRONTEND
// =========================

app.use(express.static(path.join(__dirname, "../public")));

// API test
app.get("/api", (req, res) => {
  res.json({
    message: "Habit Tracker API is running"
  });
});

// =========================
// DEFAULT
// =========================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;