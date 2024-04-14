// models/DiaryEntry.js

class DiaryEntry {
  static async create(
    db,
    { userId, title, description, date, location, photos }
  ) {
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

  static async findByUserId(db, userId) {
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

  static async update(db, id, { title, description, date, location, photos }) {
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

  static async delete(db, id) {
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
