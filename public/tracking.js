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


  const data = await response
    .json()
    .catch(() => ({}));


  if (!response.ok) {

    throw new Error(
      data.message || "Terjadi kesalahan"
    );

  }


  return data;

}


// =========================
// ELEMENTS
// =========================

const userName =
  document.getElementById("user-name");

const userRole =
  document.getElementById("user-role");

const userAvatar =
  document.getElementById("user-avatar");

const trackingDate =
  document.getElementById("tracking-date");

const trackingList =
  document.getElementById("tracking-list");

const trackingMessage =
  document.getElementById("tracking-message");


// =========================
// DATE
// =========================

function getToday() {

  const date = new Date();

  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;

}


// =========================
// LOAD USER
// =========================

async function loadUser() {

  try {

    const data =
      await apiFetch("/auth/me");

    const user =
      data.user;


    userName.textContent =
      user.name;

    userRole.textContent =
      user.role === "admin"
        ? "Administrator"
        : "User";

    userAvatar.textContent =
      user.name
        .charAt(0)
        .toUpperCase();

  } catch (error) {

    window.location.href =
      "/index.html";

  }

}


// =========================
// LOAD HABITS
// =========================

async function loadTracking() {

  trackingList.innerHTML = `
    <p class="loading-text">
      Memuat habit...
    </p>
  `;


  trackingMessage.textContent = "";


  try {

    const [habitData, logData] =
      await Promise.all([

        apiFetch("/habits"),

        apiFetch("/habit-logs")

      ]);


    const activeHabits =
      habitData.habits.filter(
        habit => habit.status === "active"
      );


    const selectedDate =
      trackingDate.value;


    const logsForDate =
      logData.logs.filter(log => {

        const logDate =
          String(log.log_date)
            .substring(0, 10);

        return logDate === selectedDate;

      });


    if (activeHabits.length === 0) {

      trackingList.innerHTML = `
        <div class="empty-state">

          <div class="empty-icon">
            ✓
          </div>

          <h3>
            Belum ada habit aktif
          </h3>

          <p>
            Tambahkan habit dari halaman Dashboard
            untuk mulai melakukan tracking.
          </p>

        </div>
      `;

      return;

    }


    trackingList.innerHTML = "";


    activeHabits.forEach(habit => {

      const existingLog =
        logsForDate.find(
          log =>
            Number(log.habit_id) ===
            Number(habit.id)
        );


      const card =
        document.createElement("div");

      card.className =
        "tracking-card";


      let statusHtml = "";


      if (existingLog) {

        const completed =
          existingLog.status === "completed";


        statusHtml = `

          <div class="tracking-result ${completed ? "completed" : "skipped"}">

            <span>
              ${completed ? "✓" : "×"}
            </span>

            ${completed ? "Selesai" : "Skipped"}

          </div>

        `;

      } else {

        statusHtml = `

          <div class="tracking-actions">

            <button
              class="tracking-button complete"
              onclick="saveTracking(${habit.id}, 'completed')"
            >
              ✓ Selesai
            </button>

            <button
              class="tracking-button skip"
              onclick="saveTracking(${habit.id}, 'skipped')"
            >
              × Skipped
            </button>

          </div>

        `;

      }


      card.innerHTML = `

        <div class="tracking-info">

          <div class="tracking-icon">
            ✓
          </div>

          <div>

            <h3>
              ${escapeHtml(habit.name)}
            </h3>

            <p>
              ${escapeHtml(
                habit.description ||
                "Tidak ada deskripsi"
              )}
            </p>

            <small>
              Target: ${habit.target}
              &nbsp;•&nbsp;
              Frekuensi: ${habit.frequency}
            </small>

          </div>

        </div>


        ${statusHtml}

      `;


      trackingList.appendChild(card);

    });


  } catch (error) {

    trackingList.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          !
        </div>

        <h3>
          Gagal memuat tracking
        </h3>

        <p>
          ${escapeHtml(error.message)}
        </p>

      </div>

    `;

    console.error(error);

  }

}


// =========================
// SAVE TRACKING
// =========================

async function saveTracking(
  habitId,
  status
) {

  const selectedDate =
    trackingDate.value;


  if (!selectedDate) {

    alert(
      "Silakan pilih tanggal terlebih dahulu."
    );

    return;

  }


  try {

    trackingMessage.textContent =
      "Menyimpan tracking...";


    await apiFetch(
      "/habit-logs",
      {

        method: "POST",

        body: JSON.stringify({

          habit_id: habitId,

          log_date: selectedDate,

          status: status

        })

      }
    );


    trackingMessage.textContent =
      "Tracking berhasil disimpan.";


    await loadTracking();


  } catch (error) {

    trackingMessage.textContent =
      error.message;

    alert(error.message);

  }

}


// =========================
// ESCAPE HTML
// =========================

function escapeHtml(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value;

  return div.innerHTML;

}


// =========================
// LOGOUT
// =========================

async function logout() {

  try {

    await apiFetch(
      "/auth/logout",
      {
        method: "POST"
      }
    );

  } catch (error) {

    console.error(error);

  }


  window.location.href =
    "/index.html";

}


// =========================
// EVENTS
// =========================

trackingDate.addEventListener(
  "change",
  loadTracking
);


document
  .getElementById("logout-button")
  .addEventListener(
    "click",
    logout
);


// =========================
// INITIAL LOAD
// =========================

async function init() {

  trackingDate.value =
    getToday();

  await loadUser();

  await loadTracking();

}


init();