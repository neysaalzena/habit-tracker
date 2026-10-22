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

  const data =
    await response.json().catch(() => ({}));

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

const userList =
  document.getElementById("user-list");

const userCount =
  document.getElementById("user-count");


// =========================
// LOAD CURRENT USER
// =========================

async function loadCurrentUser() {

  try {

    const data =
      await apiFetch("/auth/me");

    const user = data.user;

    // Admin check
    if (user.role !== "admin") {

      alert(
        "Akses hanya untuk administrator."
      );

      window.location.href =
        "/dashboard.html";

      return false;
    }

    userName.textContent =
      user.name;

    userRole.textContent =
      "Administrator";

    userAvatar.textContent =
      user.name
        .charAt(0)
        .toUpperCase();

    return true;

  } catch (error) {

    window.location.href =
      "/index.html";

    return false;

  }

}


// =========================
// FORMAT DATE
// =========================

function formatDate(dateString) {

  if (!dateString) {
    return "-";
  }

  const date =
    new Date(dateString);

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


// =========================
// LOAD USERS
// =========================

async function loadUsers() {

  userList.innerHTML = `
    <p class="loading-text">
      Memuat pengguna...
    </p>
  `;

  try {

    const data =
      await apiFetch("/admin/users");

    const users =
      data.users || [];

    userCount.textContent =
      users.length;


    if (users.length === 0) {

      userList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">●</div>

          <h3>Belum ada pengguna</h3>

          <p>
            Tidak terdapat data pengguna.
          </p>
        </div>
      `;

      return;
    }


    userList.innerHTML = "";


    users.forEach(user => {

      const card =
        document.createElement("div");

      card.className =
        "admin-user-card";


      const isCurrentUser =
        Number(user.id) ===
        getCurrentUserId();


      card.innerHTML = `

        <div class="admin-user-info">

          <div class="admin-user-avatar">
            ${escapeHtml(
              user.name
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div>

            <h3>
              ${escapeHtml(user.name)}
            </h3>

            <p>
              ${escapeHtml(user.email)}
            </p>

            <small>
              ID: ${user.id}
              &nbsp;•&nbsp;
              Dibuat: ${formatDate(user.created_at)}
            </small>

          </div>

        </div>


        <div class="admin-user-actions">

          <select
            class="role-select"
            data-user-id="${user.id}"
            ${isCurrentUser ? "disabled" : ""}
          >

            <option
              value="user"
              ${user.role === "user" ? "selected" : ""}
            >
              User
            </option>

            <option
              value="admin"
              ${user.role === "admin" ? "selected" : ""}
            >
              Admin
            </option>

          </select>


          ${
            isCurrentUser
              ? `
                <span class="current-account">
                  Akun Anda
                </span>
              `
              : `
                <button
                  class="action-button delete"
                  onclick="deleteUser(${user.id})"
                >
                  Hapus
                </button>
              `
          }

        </div>

      `;


      const roleSelect =
        card.querySelector(".role-select");


      if (roleSelect) {

        roleSelect.addEventListener(
          "change",
          event => {

            updateRole(
              user.id,
              event.target.value
            );

          }
        );

      }


      userList.appendChild(card);

    });

  } catch (error) {

    userList.innerHTML = `
      <p class="loading-text">
        ${escapeHtml(error.message)}
      </p>
    `;

  }

}


// =========================
// CURRENT USER ID
// =========================

let currentUserId = null;


function getCurrentUserId() {
  return currentUserId;
}


// =========================
// UPDATE ROLE
// =========================

async function updateRole(
  userId,
  role
) {

  const confirmUpdate =
    confirm(
      `Ubah role user menjadi "${role}"?`
    );

  if (!confirmUpdate) {

    await loadUsers();

    return;
  }


  try {

    await apiFetch(
      `/admin/users/${userId}/role`,
      {
        method: "PUT",

        body: JSON.stringify({
          role
        })
      }
    );


    alert(
      "Role berhasil diperbarui."
    );

    await loadUsers();

  } catch (error) {

    alert(error.message);

    await loadUsers();

  }

}


// =========================
// DELETE USER
// =========================

async function deleteUser(userId) {

  const confirmDelete =
    confirm(
      "Apakah kamu yakin ingin menghapus user ini?"
    );

  if (!confirmDelete) {
    return;
  }


  try {

    await apiFetch(
      `/admin/users/${userId}`,
      {
        method: "DELETE"
      }
    );


    alert(
      "User berhasil dihapus."
    );


    await loadUsers();

  } catch (error) {

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

  try {

    const data =
      await apiFetch("/auth/me");

    const user =
      data.user;

    currentUserId =
      Number(user.id);

    if (user.role !== "admin") {

      alert(
        "Akses hanya untuk administrator."
      );

      window.location.href =
        "/dashboard.html";

      return;
    }

    userName.textContent =
      user.name;

    userRole.textContent =
      "Administrator";

    userAvatar.textContent =
      user.name
        .charAt(0)
        .toUpperCase();


    await loadUsers();

  } catch (error) {

    window.location.href =
      "/index.html";

  }

}

init();