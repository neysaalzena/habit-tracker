const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");

const showRegisterButton = document.getElementById("show-register");
const showLoginButton = document.getElementById("show-login");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginMessage = document.getElementById("login-message");
const registerMessage = document.getElementById("register-message");

// =========================
// PWA - SERVICE WORKER
// =========================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => {
        console.log("Service Worker berhasil didaftarkan.");
      })
      .catch(error => {
        console.error("Service Worker gagal didaftarkan:", error);
      });
  });
}

// =========================
// LOGIN → REGISTER
// =========================

showRegisterButton.addEventListener("click", () => {
  loginSection.classList.add("hidden");
  registerSection.classList.remove("hidden");

  loginMessage.textContent = "";
});

// =========================
// REGISTER → LOGIN
// =========================

showLoginButton.addEventListener("click", () => {
  registerSection.classList.add("hidden");
  loginSection.classList.remove("hidden");

  registerMessage.textContent = "";
});

// =========================
// LOGIN
// =========================

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      loginMessage.textContent = data.message;
      return;
    }

    loginMessage.textContent = "Login berhasil!";

    alert(`Selamat datang, ${data.user.name}!`);

    window.location.href = "/dashboard.html";
  } catch (error) {
    console.error(error);

    loginMessage.textContent =
      "Tidak dapat terhubung ke server";
  }
});

// =========================
// REGISTER
// =========================

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      registerMessage.textContent = data.message;
      return;
    }

    registerMessage.textContent =
      "Registrasi berhasil! Silakan login.";

    registerForm.reset();

    setTimeout(() => {
      registerSection.classList.add("hidden");
      loginSection.classList.remove("hidden");
      registerMessage.textContent = "";
    }, 1000);

  } catch (error) {
    console.error(error);

    registerMessage.textContent =
      "Tidak dapat terhubung ke server";
  }
});