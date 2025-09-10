const fs = require("fs");
const jwt = require("jsonwebtoken");
const Note = require("../models/notes"); 

const ADMIN = { username: "admin", password: "admin123" };

exports.adminLogin = (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN.username || password !== ADMIN.password) {
    return res.json({
      success: false,
      message: "Invalid Username and Password",
    });
  }

  const token = jwt.sign(
    { admin: true, username: ADMIN.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({ success: true, token });
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate("author", "username");
    res.json(notes);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching notes" });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }

    if (note.file && note.file.path) {
      fs.unlink(note.file.path, (err) => {
        if (err) console.log(err);
      });
    }

    await note.deleteOne();
    res.json({ success: true, message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting note" });
  }
};
