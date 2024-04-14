// models/User.js
const db = require("../app");

class User {
  static async create({ name, email, password }) {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password],
        function (err) {
          if (err) {
            reject(err);
          }
          resolve({ id: this.lastID, name, email });
        }
      );
    });
  }

  static async authenticate(email, password) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
          reject(err);
        }
        if (!row) {
          reject(new Error("User not found"));
        } else {
          if (row.password === password) {
            resolve({ id: row.id, name: row.name, email: row.email });
          } else {
            reject(new Error("Invalid password"));
          }
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) {
          reject(err);
        }
        if (!row) {
          reject(new Error("User not found"));
        } else {
          resolve({ id: row.id, name: row.name, email: row.email });
        }
      });
    });
  }
}

module.exports = User;
