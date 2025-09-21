const fs = require("fs");
const Note = require("../models/note-model");

exports.getNotes = async (req, res) => {
  const notes = await Note.find().populate("author", "username");
  res.json(notes);
};

exports.createNote = async (req, res) => {
  const { title, text } = req.body;
  let file = null;

  if (req.file) {
    file = {
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      path: req.file.path,
    };
  }

  const note = await Note.create({
    title,
    text,
    author: req.user.userId,
    file,
  });

  res.json({ success: true, note });
};

exports.deleteNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note)
    return res.status(404).json({ success: false, message: "Note not found" });

  if (note.author.toString() !== req.user.userId)
    return res.status(403).json({ success: false, message: "Not allowed" });

  if (note.file && note.file.path) {
    fs.unlink(note.file.path, (err) => err && console.log(err));
  }

  await note.deleteOne();
  res.json({ success: true, message: "Note deleted" });
};
