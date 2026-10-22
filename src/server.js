const app = require("./app");
const db = require("./config/db");

const PORT = 3000;

db.getConnection()
  .then(connection => {
    console.log("Database berhasil terhubung!");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error("Gagal terhubung ke database:", error.message);
  });