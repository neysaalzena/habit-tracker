
const API = "/api";

// =========================
// HELPER
// =========================

async function apiFetch(url, options = {}) {
  const response = await fetch(API + url, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan");
  }

  return data;
}

// =========================
// ELEMENTS
// =========================

const userName = document.getElementById("user-name");
const userRole = document.getElementById("user-role");
const userAvatar = document.getElementById("user-avatar");

const historyDate = document.getElementById("history-date");
const historyList = document.getElementById("history-list");
const historyMessage = document.getElementById("history-message");
const resetDate = document.getElementById("reset-date");

// =========================
// LOAD USER
// =========================

async function loadUser() {
  try {
    const data = await apiFetch("/auth/me");
    const user = data.user;

    userName.textContent = user.name;
    userRole.textContent =
      user.role === "admin" ? "Administrator" : "User";

    userAvatar.textContent = user.name.charAt(0).toUpperCase();
  } catch (error) {
    window.location.href = "/index.html";
  }
}

// =========================
// NORMALIZE DATE
// =========================

function getDateOnly(value) {
  if (!value) return "";
  return String(value).substring(0, 10);
}

// =========================
// LOAD HISTORY
// =========================

async function loadHistory() {
  historyList.innerHTML = `
    <p class="loading-text">Memuat riwayat...</p>
  `;

  historyMessage.textContent = "";

  try {
    const data = await apiFetch("/habit-logs");
    let logs = data.logs || [];

    // Filter tanggal yang dipilih.
    if (historyDate.value) {
      logs = logs.filter(log => {
        return getDateOnly(log.log_date) === historyDate.value;
      });
    }

    // Urutkan dari tanggal terbaru.
    logs.sort((a, b) => {
      return getDateOnly(b.log_date)
        .localeCompare(getDateOnly(a.log_date));
    });

    if (logs.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">▣</div>
          <h3>Belum ada riwayat</h3>
          <p>
            Belum ada aktivitas pada tanggal yang dipilih.
          </p>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    logs.forEach(log => {
      const card = document.createElement("div");
      card.className = "history-card";

      const completed = log.status === "completed";
      const statusText = completed ? "Selesai" : "Skipped";
      const statusClass = completed ? "completed" : "skipped";
      const icon = completed ? "✓" : "×";
      const dateText = formatDate(log.log_date);

      card.innerHTML = `
        <div class="history-icon ${statusClass}">
          ${icon}
        </div>

        <div class="history-info">
          <h3>${escapeHtml(log.habit_name || "Habit")}</h3>
          <p>
            ${escapeHtml(
              log.habit_description || "Tidak ada deskripsi"
            )}
          </p>
          <small>${dateText}</small>
        </div>

        <div class="history-status ${statusClass}">
          ${statusText}
        </div>
      `;

      fragment.appendChild(card);
    });

    historyList.replaceChildren(fragment);
  } catch (error) {
    historyList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">!</div>
        <h3>Gagal memuat riwayat</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;

    console.error("Gagal memuat riwayat:", error);
  }
}

// =========================
// FORMAT DATE
// =========================

function formatDate(value) {
  const dateOnly = getDateOnly(value);

  if (!dateOnly) return value;

  const parts = dateOnly.split("-");

  if (parts.length !== 3) return value;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (!year || !month || !day) return value;

  // Gunakan tanggal lokal untuk mencegah pergeseran hari.
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

// =========================
// ESCAPE HTML
// =========================

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

// =========================
// LOGOUT
// =========================

async function logout() {
  try {
    await apiFetch("/auth/logout", {
      method: "POST"
    });
  } catch (error) {
    console.error(error);
  }

  window.location.href = "/index.html";
}

// =========================
// EVENTS
// =========================

historyDate.addEventListener("change", loadHistory);

resetDate.addEventListener("click", () => {
  historyDate.value = "";
  loadHistory();
});

document
  .getElementById("logout-button")
  .addEventListener("click", logout);

// =========================
// INITIAL LOAD
// =========================

async function init() {
  await Promise.all([
    loadUser(),
    loadHistory()
  ]);
}

init();
