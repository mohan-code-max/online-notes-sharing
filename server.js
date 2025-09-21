// ======================= ALL-IN-ONE NOTES APP =======================

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ---------------- CONFIG ----------------
const PORT = 3000;
const MONGODB_URL =
  "mongodb+srv://pradhanmohan890:mohan7442@cluster0.1uccnl1.mongodb.net/notesdb?retryWrites=true&w=majority";
const JWT_SECRET = "secret123";
const ADMIN = { username: "admin", password: "admin123" };

// ---------------- CONNECT DB ----------------
mongoose
  .connect(MONGODB_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ---------------- SCHEMAS ----------------
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

const NoteSchema = new mongoose.Schema({
  title: String,
  text: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  file: {
    originalname: String,
    filename: String,
    mimetype: String,
    path: String,
  },
  createdAt: { type: Date, default: Date.now },
});
const Note = mongoose.model("Note", NoteSchema);

// ---------------- MIDDLEWARE ----------------
const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ msg: "Invalid token" });
    req.user = user;
    next();
  });
};

const adminAuth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, admin) => {
    if (err || !admin.admin)
      return res.status(403).json({ msg: "Unauthorized" });
    req.admin = admin;
    next();
  });
};

// ---------------- MULTER ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ---------------- EXPRESS APP ----------------
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});
app.use(express.static(path.join(__dirname, "public")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------- AUTH ROUTES ----------------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.json({ success: false, message: "Missing credentials" });

    if (await User.findOne({ username }))
      return res.json({ success: false, message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });

    res.json({ success: true, message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error registering user" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({
        success: false,
        message: "Invalid Username and Password",
      });

    const token = jwt.sign({ userId: user._id, username }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error logging in" });
  }
});

// ---------------- ADMIN ROUTES ----------------
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN.username || password !== ADMIN.password)
    return res.json({
      success: false,
      message: "Invalid Username and Password",
    });

  const token = jwt.sign(
    { admin: true, username: ADMIN.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({ success: true, token });
});

app.get("/api/admin/notes", adminAuth, async (req, res) => {
  const notes = await Note.find().populate("author", "username");
  res.json(notes);
});

app.delete("/api/admin/notes/:id", adminAuth, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note)
    return res.status(404).json({ success: false, message: "Note not found" });

  if (note.file && note.file.path)
    fs.unlink(note.file.path, (err) => err && console.log(err));
  await note.deleteOne();
  res.json({ success: true, message: "Note deleted" });
});

// ---------------- USER NOTES ROUTES ----------------
app.get("/api/notes", auth, async (req, res) => {
  const notes = await Note.find().populate("author", "username");
  res.json(notes);
});

app.post("/api/notes", auth, upload.single("file"), async (req, res) => {
  const { title, text } = req.body;
  let file = null;

  if (req.file)
    file = {
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      path: req.file.path,
    };

  const note = await Note.create({
    title,
    text,
    author: req.user.userId,
    file,
  });
  res.json({ success: true, note });
});

// DELETE NOTE (only own note)
app.delete("/api/notes/:id", auth, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note)
    return res.status(404).json({ success: false, message: "Note not found" });

  if (note.author.toString() !== req.user.userId)
    return res.status(403).json({ success: false, message: "Not allowed" });

  if (note.file && note.file.path)
    fs.unlink(note.file.path, (err) => err && console.log(err));
  await note.deleteOne();
  res.json({ success: true, message: "Note deleted" });
});

// ---------------- START SERVER ----------------
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);





// const express = require("express");
// const dotenv = require("dotenv");
// const path = require("path");
// const connectDB = require("./config/db");

// dotenv.config();
// const app = express();

// // Connect DB
// connectDB();

// // Middleware
// app.use(express.json());

// // Static files
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "home.html"));
// });
// app.use(express.static(path.join(__dirname, "public")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Routes
// app.use("/api/auth", require("./routes/auth-routes"));
// app.use("/api/admin", require("./routes/admin-routes"));
// app.use("/api/notes", require("./routes/note-routes"));

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () =>
//   console.log(`🚀 Server running at http://localhost:${PORT}`)
// );
