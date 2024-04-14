// models/DiaryEntry.js
const db = require("../app");

class DiaryEntry {
  static async create({ userId, title, description, date, location, photos }) {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO diary_entries (user_id, title, description, date, location, photos) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, title, description, date, location, photos],
        function (err) {
          if (err) {
            reject(err);
          }
          resolve({
            id: this.lastID,
            userId,
            title,
            description,
            date,
            location,
            photos,
          });
        }
      );
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM diary_entries WHERE user_id = ?",
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          }
          resolve(rows);
        }
      );
    });
  }

  static async update(id, { title, description, date, location, photos }) {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE diary_entries SET title = ?, description = ?, date = ?, location = ?, photos = ? WHERE id = ?",
        [title, description, date, location, photos, id],
        function (err) {
          if (err) {
            reject(err);
          }
          resolve({ id, title, description, date, location, photos });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM diary_entries WHERE id = ?", [id], function (err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}

module.exports = DiaryEntry;
