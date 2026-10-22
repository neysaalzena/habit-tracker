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

const profileAvatar =
  document.getElementById("profile-avatar");

const profileNameDisplay =
  document.getElementById("profile-name-display");

const profileEmailDisplay =
  document.getElementById("profile-email-display");

const profileForm =
  document.getElementById("profile-form");

const profileName =
  document.getElementById("profile-name");

const profileEmail =
  document.getElementById("profile-email");

const profileRole =
  document.getElementById("profile-role");

const profileMessage =
  document.getElementById("profile-message");

const profileId =
  document.getElementById("profile-id");

const profileCreated =
  document.getElementById("profile-created");

const profileUpdated =
  document.getElementById("profile-updated");


// =========================
// FORMAT DATE
// =========================

function formatDate(dateString) {

  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );
}


// =========================
// LOAD PROFILE
// =========================

async function loadProfile() {

  try {

    const data =
      await apiFetch("/auth/me");

    const user = data.user;


    // TOPBAR

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


    // PROFILE HEADER

    profileAvatar.textContent =
      user.name
        .charAt(0)
        .toUpperCase();

    profileNameDisplay.textContent =
      user.name;

    profileEmailDisplay.textContent =
      user.email;


    // FORM

    profileName.value =
      user.name;

    profileEmail.value =
      user.email;

    profileRole.value =
      user.role === "admin"
        ? "Administrator"
        : "User";


    // ACCOUNT INFORMATION

    profileId.textContent =
      user.id;

    profileCreated.textContent =
      formatDate(user.created_at);

    profileUpdated.textContent =
      formatDate(user.updated_at);

  } catch (error) {

    window.location.href =
      "/index.html";

  }

}


// =========================
// UPDATE PROFILE
// =========================

profileForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const name =
      profileName.value.trim();

    const email =
      profileEmail.value.trim();


    if (!name || !email) {

      profileMessage.textContent =
        "Nama dan email wajib diisi.";

      return;

    }


    try {

      profileMessage.textContent =
        "Menyimpan...";


      await apiFetch(
        "/auth/profile",
        {
          method: "PUT",

          body: JSON.stringify({
            name,
            email
          })
        }
      );


      profileMessage.textContent =
        "Profil berhasil diperbarui.";


      await loadProfile();


    } catch (error) {

      profileMessage.textContent =
        error.message;

    }

  }
);


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

loadProfile();