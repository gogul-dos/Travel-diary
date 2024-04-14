const express = require("express");
const jwt = require("jsonwebtoken");
const { open } = require("sqlite");
const authMiddleware = require("./middleware/authMiddleware");
const path = require("path");
const sqlite3 = require("sqlite3");
const User = require("./models/User");
const DiaryEntry = require("./models/DiaryEntry");

const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());

let db = null;
const databasePath = path.join(__dirname, "travel_diary.db");
const initializer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("http://localhost:3000/ is Running...");
    });
    const createUserTable = `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`;

    const createDiaryEntryTable = `CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      photos TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`;

    db.getDatabaseInstance().serialize(() => {
      db.exec(createUserTable);
      db.exec(createDiaryEntryTable);
    });

    // User routes
    app.get("/trips", async (req, res) => {
      try {
        const trips = await db.all("SELECT * FROM diary_entries");
        res.json({ trips });
      } catch (error) {
        console.error("Error fetching trips:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    app.post("/register", async (req, res) => {
      try {
        const user = await User.create(db, req.body);
        res.status(201).send({ user });
      } catch (err) {
        res.status(400).send({ error: err.message });
      }
    });

    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      try {
        const user = await User.authenticate(db, email, password);
        const token = jwt.sign({ userId: user.id }, "secret");
        res.send(token);
        console.log(token);
      } catch (err) {
        res.status(401).json({ error: "Invalid credentials" });
      }
    });

    app.get("/profile", authMiddleware, async (req, res) => {
      try {
        const user = await User.findById(db, req.userId);
        res.json({ user });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.get("/", async (req, res) => {
      try {
        const trips = "Your Server is active";
        res.json({ trips });
      } catch (error) {
        console.error("Error fetching trips:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Diary Entry routes
    app.get("/diaryEntries", authMiddleware, async (req, res) => {
      try {
        const diaryEntries = await DiaryEntry.findByUserId(db, req.userId);
        res.json({ diaryEntries });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.post("/diaryEntries", authMiddleware, async (req, res) => {
      try {
        req.body.userId = req.userId;
        const diaryEntry = await DiaryEntry.create(db, req.body);
        res.status(201).json({ diaryEntry });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.put("/diaryEntries/:id", authMiddleware, async (req, res) => {
      try {
        const diaryEntry = await DiaryEntry.update(db, req.params.id, req.body);
        res.json({ diaryEntry });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.delete("/diaryEntries/:id", authMiddleware, async (req, res) => {
      try {
        await DiaryEntry.delete(db, req.params.id);
        res.sendStatus(204);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });
  } catch (e) {
    console.log(`DB Error: '${e.message}'`);
  }
};

initializer();

module.exports = db;
