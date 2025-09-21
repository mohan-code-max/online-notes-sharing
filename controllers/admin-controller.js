const jwt = require("jsonwebtoken");
const fs = require("fs");
const Note = require("../models/note-model");

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.json({ success: false, message: "Invalid Username or Password" });
  }

  const token = jwt.sign(
    { admin: true, username: process.env.ADMIN_USERNAME },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({ success: true, token });
};

exports.getNotes = async (req, res) => {
  const notes = await Note.find().populate("author", "username");
  res.json(notes);
};

exports.deleteNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note)
    return res.status(404).json({ success: false, message: "Note not found" });

  if (note.file && note.file.path) {
    fs.unlink(note.file.path, (err) => err && console.log(err));
  }
  await note.deleteOne();
  res.json({ success: true, message: "Note deleted" });
};
