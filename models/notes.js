const mongoose = require("mongoose");

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

module.exports = mongoose.model("Note", NoteSchema);
