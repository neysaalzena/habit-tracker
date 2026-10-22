# BLUEPRINT APLIKASI WEB HABIT TRACKER

## 1. Ringkasan Eksekutif

Habit Tracker adalah aplikasi web untuk membantu pengguna mengelola kebiasaan, mencatat aktivitas harian, melihat kalender dan riwayat, serta memantau perkembangan melalui statistik.

Aplikasi digunakan melalui desktop dan mobile dengan pendekatan Progressive Web App (PWA), sehingga satu basis kode dapat melayani kedua bentuk perangkat.

Arsitektur menggunakan client-server berlapis dengan pemisahan:
- Presentation layer
- Application/business logic layer
- Data layer

Backend menggunakan pendekatan modular monolith agar setiap modul memiliki tanggung jawab yang jelas.

## 2. Prinsip Arsitektur

- Separation of concerns
- Modular monolith
- API-first
- Mobile-first dan responsive
- Data consistency
- Security by design

Pencatatan aktivitas menggunakan kombinasi habit dan tanggal untuk mencegah duplikasi log.

## 3. Technology Stack

| Komponen | Teknologi | Peran |
|---|---|---|
| Frontend | HTML5, CSS3, JavaScript | Antarmuka responsif dan interaksi pengguna |
| Backend | Node.js + Express.js | REST API, autentikasi, validasi, business logic |
| Database | MySQL | Penyimpanan data relasional |
| API | REST API | Komunikasi frontend dan backend |
| Authentication | Session/JWT + bcrypt | Autentikasi dan keamanan kredensial |
| PWA | Web App Manifest + Service Worker | Instalasi PWA dan caching aset |
| Version Control | Git | Pengelolaan versi source code |
| Development | Visual Studio Code | Lingkungan pengembangan |

## 4. Arsitektur Sistem

Alur utama:

Frontend PWA → REST API → Backend Node.js + Express.js → Database MySQL

Frontend menjadi lapisan presentasi. Backend menjalankan autentikasi, validasi, dan logika setiap modul sebelum membaca atau mengubah data pada database.

## 5. Modul Aplikasi

### 5.1 Autentikasi & Profil Pengguna
- Register
- Login
- Logout
- Profil
- Role: user dan admin

Endpoint utama:
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /users/me
- PATCH /users/me

### 5.2 Manajemen Habit
CRUD habit milik pengguna.

Data habit:
- Nama
- Deskripsi
- Kategori
- Target
- Frekuensi
- Status

Endpoint:
- GET /habits
- POST /habits
- GET /habits/:id
- PATCH /habits/:id
- DELETE /habits/:id

### 5.3 Daily Tracking
Mencatat status penyelesaian habit berdasarkan tanggal.

Sistem:
- Memvalidasi kepemilikan habit
- Mencegah pencatatan ganda untuk habit dan tanggal yang sama

Endpoint:
- POST /habit-logs
- DELETE /habit-logs/:id
- GET /habit-logs?date=

### 5.4 Kalender & Riwayat
Menampilkan aktivitas habit dalam bentuk kalender dan daftar riwayat berdasarkan rentang tanggal.

Data berasal dari `habit_logs`, sehingga tidak diperlukan tabel kalender terpisah.

### 5.5 Progress & Statistik
Mengolah `habit_logs` menjadi:
- Jumlah penyelesaian
- Persentase completion
- Statistik berdasarkan periode tertentu
- Grafik sederhana

### 5.6 Modul Kategori
Mengelola kategori habit untuk pengelompokan dan penyaringan.

Admin dapat:
- Membuat kategori
- Mengubah kategori
- Menghapus kategori

### 5.7 Modul Administrasi
Admin dapat mengelola:
- Pengguna
- Kategori
- Data sistem yang relevan

Akses dibatasi dengan role-based access control.

## 6. PWA

PWA menggunakan:
- Web App Manifest untuk identitas aplikasi, ikon, dan mode standalone
- Service Worker untuk caching aset statis
- Responsive layout dengan pendekatan mobile-first

Layout:
- Desktop: sidebar dan area konten lebih lebar
- Mobile: bottom navigation dan layout satu kolom

Struktur data dan API tetap sama pada desktop dan mobile.

## 7. UML

### 7.1 Use Case Diagram
Aktor:
- User
- Admin

User berinteraksi dengan:
- Autentikasi
- Profil
- Habit
- Tracking
- Kalender/riwayat
- Statistik

Admin memiliki fungsi tambahan:
- Pengelolaan pengguna
- Pengelolaan kategori
- Pengelolaan data sistem

### 7.2 Class Diagram
Domain model inti:
- User
- Category
- Habit
- HabitLog

Relasi:
- Satu User memiliki banyak Habit
- Satu Category dapat digunakan banyak Habit
- Satu Habit memiliki banyak HabitLog

### 7.3 Sequence Diagram — Login
Alur:
PWA mengirim kredensial → REST API memvalidasi → database mengambil user → session/token dibuat jika kredensial valid.

### 7.4 Sequence Diagram — Catat Habit Harian
Alur:
PWA mengirim request → REST API → Habit Service memvalidasi habit dan tanggal → menyimpan habit log → mengembalikan hasil ke PWA.

### 7.5 ERD
Empat tabel inti:
- users
- categories
- habits
- habit_logs

Relasi:
- users 1:N habits
- categories 1:N habits
- habits 1:N habit_logs

### 7.6 Deployment Diagram
Menjelaskan infrastruktur aplikasi, frontend/PWA, backend, dan database.

## 8. Database Design

### users
- id — Primary Key
- name
- email — UNIQUE
- password_hash
- role
- created_at
- updated_at

Keterangan: data akun dan role pengguna.

### categories
- id — Primary Key
- name
- description
- created_at

Keterangan: data kategori habit.

### habits
- id — Primary Key
- user_id — Foreign Key
- category_id — Foreign Key
- name
- description
- target
- frequency
- status
- created_at
- updated_at

Keterangan: data kebiasaan pengguna.

### habit_logs
- id — Primary Key
- habit_id — Foreign Key
- log_date
- status
- created_at

Keterangan: catatan penyelesaian habit per tanggal.

Constraint penting:
- Email user UNIQUE
- Category name dapat diberi constraint sesuai kebutuhan
- UNIQUE (habit_id, log_date) pada habit_logs untuk mencegah duplikasi pencatatan pada tanggal yang sama

## 9. REST API Utama

### Auth
- POST /auth/register — Registrasi
- POST /auth/login — Login
- POST /auth/logout — Logout

### User
- GET /users/me — Profil user
- PATCH /users/me — Ubah profil

### Habit
- GET /habits — Daftar habit
- POST /habits — Tambah habit
- GET /habits/:id — Detail habit
- PATCH /habits/:id — Ubah habit
- DELETE /habits/:id — Hapus habit

### Tracking
- POST /habit-logs — Catat aktivitas
- DELETE /habit-logs/:id — Hapus log
- GET /habit-logs?date= — Lihat log berdasarkan tanggal

### Statistics
- GET /statistics?period= — Ambil statistik progress

### Category
- CRUD /categories — Kelola kategori

### Admin
- GET /admin/users — Kelola pengguna

## 10. Struktur Halaman

### Halaman publik
- Login
- Register

### Halaman user
- Dashboard
- Daftar Habit
- Tambah/Edit Habit
- Kalender & Riwayat
- Progress & Statistik
- Profil

### Halaman admin
- Dashboard Admin
- Manajemen Pengguna
- Manajemen Kategori
- Pengelolaan data sistem

## 11. Keamanan

- Password disimpan dalam bentuk hash menggunakan bcrypt atau algoritma hashing password yang setara
- Endpoint yang membutuhkan akun dilindungi autentikasi
- Endpoint administrasi menggunakan role-based access control
- Input divalidasi di backend
- Perlindungan terhadap data tidak valid dan risiko injection
- Produksi menggunakan HTTPS
- Kredensial database dan konfigurasi rahasia tidak disimpan langsung dalam source code

## 12. Testing

Pengujian mencakup:
- Unit test untuk business logic
- Integration test untuk REST API dan database
- Functional test untuk:
  - Registrasi
  - Login
  - Pembuatan habit
  - Pencatatan aktivitas
  - Kalender
  - Statistik
- Pengujian responsive pada desktop dan mobile

## 13. Roadmap Implementasi

### Fase 1 — Fondasi
- Inisialisasi project
- Struktur database
- Autentikasi
- Role user/admin
- Layout PWA

### Fase 2 — Habit Management
- CRUD habit
- Kategori
- Validasi kepemilikan data
- Dashboard

### Fase 3 — Tracking
- Pencatatan habit harian
- Kalender
- Riwayat
- Pencegahan duplikasi log

### Fase 4 — Progress
- Perhitungan completion
- Statistik periode
- Visualisasi progress

### Fase 5 — Finalisasi
- Testing
- Security hardening
- Responsive UI
- PWA installability
- Deployment
- Dokumentasi

## 14. Batasan Fungsional

Tidak termasuk:
- Streak
- Achievement/reward
- Reminder/notifikasi
- Pembayaran
- AI/rekomendasi
- Integrasi media sosial
- Integrasi kalender eksternal
- Arsitektur microservices

## 15. Aturan Konsistensi Implementasi

Blueprint ini menjadi acuan utama implementasi.

Jangan menambahkan fitur di luar scope tanpa persetujuan.

Setiap perubahan harus tetap konsisten antara:
- Requirement
- Modul
- Database
- UML
- REST API
- Frontend
- Backend
- PWA

Untuk implementasi lokal saat ini:
- Database: MariaDB 10.4.32 melalui XAMPP
- Backend: Node.js + Express.js
- Frontend: HTML/CSS/JavaScript
- Port aplikasi: 3000
- Authentication: JWT httpOnly cookie
- Repository: Git + GitHub
- CI: GitHub Actions
