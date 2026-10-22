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

const categoryList =
  document.getElementById("category-list");

const categoryMessage =
  document.getElementById("category-message");

const categoryModal =
  document.getElementById("category-modal");

const categoryForm =
  document.getElementById("category-form");

const categoryId =
  document.getElementById("category-id");

const categoryName =
  document.getElementById("category-name");

const categoryModalTitle =
  document.getElementById("category-modal-title");

const categoryFormMessage =
  document.getElementById("category-form-message");


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
// LOAD CATEGORIES
// =========================

async function loadCategories() {

  categoryList.innerHTML = `
    <p class="loading-text">
      Memuat kategori...
    </p>
  `;


  try {

    const data =
      await apiFetch("/categories");


    const categories =
      data.categories || [];


    if (categories.length === 0) {

      categoryList.innerHTML = `

        <div class="empty-state">

          <div class="empty-icon">
            ◆
          </div>

          <h3>
            Belum ada kategori
          </h3>

          <p>
            Tambahkan kategori untuk
            mengelompokkan habit kamu.
          </p>

        </div>

      `;

      return;

    }


    categoryList.innerHTML = "";


    categories.forEach(category => {

      const card =
        document.createElement("div");

      card.className =
        "category-card";


      card.innerHTML = `

        <div class="category-info">

          <div class="category-icon">
            ◆
          </div>

          <div>

            <h3>
              ${escapeHtml(category.name)}
            </h3>

            <span>
              Kategori habit
            </span>

          </div>

        </div>


        <div class="category-actions">

          <button
            type="button"
            class="action-button edit"
            onclick="openEditCategory(${category.id}, '${escapeAttribute(category.name)}')"
          >
            Edit
          </button>

          <button
            type="button"
            class="action-button delete"
            onclick="deleteCategory(${category.id})"
          >
            Hapus
          </button>

        </div>

      `;


      categoryList.appendChild(card);

    });


  } catch (error) {

    categoryList.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          !
        </div>

        <h3>
          Gagal memuat kategori
        </h3>

        <p>
          ${escapeHtml(error.message)}
        </p>

      </div>

    `;

  }

}


// =========================
// OPEN ADD
// =========================

function openAddCategory() {

  categoryForm.reset();

  categoryId.value = "";

  categoryModalTitle.textContent =
    "Tambah Kategori";

  categoryFormMessage.textContent =
    "";

  categoryModal.classList.remove(
    "hidden"
  );

  categoryName.focus();

}


// =========================
// OPEN EDIT
// =========================

function openEditCategory(id, name) {

  categoryId.value =
    id;

  categoryName.value =
    name;

  categoryModalTitle.textContent =
    "Edit Kategori";

  categoryFormMessage.textContent =
    "";

  categoryModal.classList.remove(
    "hidden"
  );

  categoryName.focus();

}


// =========================
// CLOSE MODAL
// =========================

function closeCategoryModal() {

  categoryModal.classList.add(
    "hidden"
  );

  categoryForm.reset();

  categoryFormMessage.textContent =
    "";

}


// =========================
// SAVE CATEGORY
// =========================

categoryForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const id =
      categoryId.value;

    const name =
      categoryName.value.trim();


    if (!name) {

      categoryFormMessage.textContent =
        "Nama kategori wajib diisi.";

      return;

    }


    try {

      categoryFormMessage.textContent =
        "Menyimpan...";


      if (id) {

        await apiFetch(
          `/categories/${id}`,
          {
            method: "PUT",

            body: JSON.stringify({
              name
            })
          }
        );

      } else {

        await apiFetch(
          "/categories",
          {
            method: "POST",

            body: JSON.stringify({
              name
            })
          }
        );

      }


      closeCategoryModal();

      await loadCategories();

      categoryMessage.textContent =
        id
          ? "Kategori berhasil diperbarui."
          : "Kategori berhasil ditambahkan.";


      setTimeout(() => {

        categoryMessage.textContent =
          "";

      }, 2500);


    } catch (error) {

      categoryFormMessage.textContent =
        error.message;

    }

  }
);


// =========================
// DELETE CATEGORY
// =========================

async function deleteCategory(id) {

  const confirmed =
    confirm(
      "Apakah kamu yakin ingin menghapus kategori ini?"
    );


  if (!confirmed) {
    return;
  }


  try {

    await apiFetch(
      `/categories/${id}`,
      {
        method: "DELETE"
      }
    );


    await loadCategories();


    categoryMessage.textContent =
      "Kategori berhasil dihapus.";


    setTimeout(() => {

      categoryMessage.textContent =
        "";

    }, 2500);


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
// ESCAPE ATTRIBUTE
// =========================

function escapeAttribute(value) {

  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
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

document
  .getElementById("add-category-button")
  .addEventListener(
    "click",
    openAddCategory
  );


document
  .getElementById("close-category-modal")
  .addEventListener(
    "click",
    closeCategoryModal
  );


document
  .getElementById("cancel-category-modal")
  .addEventListener(
    "click",
    closeCategoryModal
  );


document
  .getElementById("logout-button")
  .addEventListener(
    "click",
    logout
);


categoryModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      categoryModal
    ) {

      closeCategoryModal();

    }

  }
);


// =========================
// INITIAL LOAD
// =========================

async function init() {

  await loadUser();

  await loadCategories();

}


init();