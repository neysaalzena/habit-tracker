
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
const welcomeName = document.getElementById("welcome-name");

const totalHabits = document.getElementById("total-habits");
const totalLogs = document.getElementById("total-logs");
const completedLogs = document.getElementById("completed-logs");

const progressMonth = document.getElementById("progress-month");
const monthlyProgressRate = document.getElementById("monthly-progress-rate");
const monthlyProgressFill = document.getElementById("monthly-progress-fill");
const monthlyProgressDetail = document.getElementById("monthly-progress-detail");

const habitList = document.getElementById("habit-list");

const habitModal = document.getElementById("habit-modal");
const habitForm = document.getElementById("habit-form");

const habitId = document.getElementById("habit-id");
const habitName = document.getElementById("habit-name");
const habitDescription = document.getElementById("habit-description");
const habitCategory = document.getElementById("habit-category");
const habitTarget = document.getElementById("habit-target");
const habitFrequency = document.getElementById("habit-frequency");
const habitStatus = document.getElementById("habit-status");

const modalTitle = document.getElementById("modal-title");
const statusGroup = document.getElementById("status-group");
const habitMessage = document.getElementById("habit-message");

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

    welcomeName.textContent = `Selamat datang, ${user.name} 👋`;
    userAvatar.textContent = user.name.charAt(0).toUpperCase();
  } catch (error) {
    window.location.href = "/index.html";
  }
}

// =========================
// LOAD STATISTICS
// =========================

async function loadStatistics() {
  try {
    const data = await apiFetch("/progress");
    const stats = data.statistics;

    totalHabits.textContent = stats.total_habits;
    totalLogs.textContent = stats.total_logs;
    completedLogs.textContent = stats.completed_logs;
  } catch (error) {
    console.error("Gagal memuat statistik:", error);
  }
}

// =========================
// LOAD MONTHLY PROGRESS
// =========================

async function loadMonthlyProgress() {
  if (
    !progressMonth ||
    !monthlyProgressRate ||
    !monthlyProgressFill ||
    !monthlyProgressDetail
  ) {
    return;
  }

  try {
    const month = progressMonth.value;

    if (!month) return;

    const data = await apiFetch(
      `/progress/monthly?month=${encodeURIComponent(month)}`
    );

    const progress = data.monthly;
    const rate = Number(progress.progress_rate) || 0;

    monthlyProgressRate.textContent = `${rate}%`;
    monthlyProgressFill.style.width = `${Math.min(100, Math.max(0, rate))}%`;

    monthlyProgressDetail.textContent =
      `${progress.completed_count} dari ${progress.total_target} target tercapai. ` +
      `Sisa target: ${progress.remaining_target}.`;
  } catch (error) {
    monthlyProgressDetail.textContent =
      "Gagal memuat progres bulanan.";

    console.error("Gagal memuat progres bulanan:", error);
  }
}

// =========================
// LOAD CATEGORIES
// =========================

async function loadCategories() {
  try {
    const data = await apiFetch("/categories");

    habitCategory.innerHTML = `
      <option value="">Tanpa kategori</option>
    `;

    data.categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      habitCategory.appendChild(option);
    });
  } catch (error) {
    console.error("Gagal memuat kategori:", error);
  }
}

// =========================
// LOAD HABITS
// =========================

async function loadHabits() {
  habitList.innerHTML = `
    <p class="loading-text">Memuat habit...</p>
  `;

  try {
    const data = await apiFetch("/habits");
    const habits = data.habits || [];

    if (habits.length === 0) {
      habitList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✓</div>
          <h3>Belum ada habit</h3>
          <p>
            Tambahkan habit pertama kamu
            untuk mulai membangun kebiasaan.
          </p>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    habits.forEach(habit => {
      const card = document.createElement("div");
      card.className = "habit-card";

      card.innerHTML = `
        <div class="habit-info">
          <div class="habit-check">✓</div>
          <div>
            <h3>${escapeHtml(habit.name)}</h3>
            <p>
              ${escapeHtml(
                habit.description || "Tidak ada deskripsi"
              )}
            </p>
            <small>
              Target: ${escapeHtml(String(habit.target))}
              &nbsp;•&nbsp;
              Frekuensi: ${escapeHtml(String(habit.frequency))}
            </small>
          </div>
        </div>

        <div class="habit-actions">
          <span class="habit-status ${escapeHtml(habit.status)}">
            ${escapeHtml(habit.status)}
          </span>

          <button
            class="action-button edit"
            onclick="openEditHabit(${Number(habit.id)})"
          >
            Edit
          </button>

          <button
            class="action-button delete"
            onclick="deleteHabit(${Number(habit.id)})"
          >
            Hapus
          </button>
        </div>
      `;

      fragment.appendChild(card);
    });

    habitList.replaceChildren(fragment);
  } catch (error) {
    habitList.innerHTML = `
      <p class="loading-text">Gagal memuat habit.</p>
    `;
    console.error("Gagal memuat habit:", error);
  }
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
// OPEN ADD MODAL
// =========================

function openAddHabit() {
  habitForm.reset();

  habitId.value = "";
  habitTarget.value = 1;
  habitFrequency.value = "daily";
  habitStatus.value = "active";

  modalTitle.textContent = "Tambah Habit";
  statusGroup.style.display = "none";
  habitMessage.textContent = "";

  habitModal.classList.remove("hidden");
}

// =========================
// OPEN EDIT MODAL
// =========================

async function openEditHabit(id) {
  try {
    const data = await apiFetch("/habits");
    const habit = (data.habits || []).find(
      item => Number(item.id) === Number(id)
    );

    if (!habit) {
      alert("Habit tidak ditemukan");
      return;
    }

    habitId.value = habit.id;
    habitName.value = habit.name;
    habitDescription.value = habit.description || "";
    habitCategory.value = habit.category_id || "";
    habitTarget.value = habit.target;
    habitFrequency.value = habit.frequency;
    habitStatus.value = habit.status;

    modalTitle.textContent = "Edit Habit";
    statusGroup.style.display = "block";
    habitMessage.textContent = "";

    habitModal.classList.remove("hidden");
  } catch (error) {
    alert(error.message);
  }
}

// =========================
// CLOSE MODAL
// =========================

function closeModal() {
  habitModal.classList.add("hidden");
  habitForm.reset();
  habitMessage.textContent = "";
}

// =========================
// SAVE HABIT
// =========================

habitForm.addEventListener("submit", async event => {
  event.preventDefault();

  const id = habitId.value;

  const body = {
    name: habitName.value.trim(),
    description: habitDescription.value.trim(),
    category_id: habitCategory.value
      ? Number(habitCategory.value)
      : null,
    target: Number(habitTarget.value),
    frequency: habitFrequency.value,
    status: habitStatus.value || "active"
  };

  try {
    habitMessage.textContent = "Menyimpan...";

    if (id) {
      await apiFetch(`/habits/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      });
    } else {
      await apiFetch("/habits", {
        method: "POST",
        body: JSON.stringify(body)
      });
    }

    closeModal();

    await Promise.all([
      loadHabits(),
      loadStatistics(),
      loadMonthlyProgress()
    ]);
  } catch (error) {
    habitMessage.textContent = error.message;
  }
});

// =========================
// DELETE HABIT
// =========================

async function deleteHabit(id) {
  const confirmDelete = confirm(
    "Apakah kamu yakin ingin menghapus habit ini?"
  );

  if (!confirmDelete) return;

  try {
    await apiFetch(`/habits/${id}`, {
      method: "DELETE"
    });

    await Promise.all([
      loadHabits(),
      loadStatistics(),
      loadMonthlyProgress()
    ]);
  } catch (error) {
    alert(error.message);
  }
}

// =========================
// LOG HABIT TODAY
// =========================

async function logHabit(id, status) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;

  try {
    await apiFetch("/habit-logs", {
      method: "POST",
      body: JSON.stringify({
        habit_id: id,
        log_date: today,
        status
      })
    });

    await Promise.all([
      loadStatistics(),
      loadMonthlyProgress()
    ]);

    alert(
      status === "completed"
        ? "Habit berhasil ditandai selesai!"
        : "Habit ditandai skipped."
    );
  } catch (error) {
    alert(error.message);
  }
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
// BUTTON EVENTS
// =========================

document
  .getElementById("add-habit-button")
  .addEventListener("click", openAddHabit);

document
  .getElementById("close-modal")
  .addEventListener("click", closeModal);

document
  .getElementById("cancel-modal")
  .addEventListener("click", closeModal);

document
  .getElementById("logout-button")
  .addEventListener("click", logout);

habitModal.addEventListener("click", event => {
  if (event.target === habitModal) {
    closeModal();
  }
});

// =========================
// INITIAL LOAD
// =========================

async function init() {
  if (progressMonth) {
    const now = new Date();

    progressMonth.value =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  await Promise.all([
    loadUser(),
    loadCategories(),
    loadHabits(),
    loadStatistics(),
    loadMonthlyProgress()
  ]);
}

if (progressMonth) {
  progressMonth.addEventListener("change", loadMonthlyProgress);
}

init();
