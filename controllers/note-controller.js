const Note = require("../models/notes");

exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate("author", "username");
    res.json(notes);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching notes" });
  }
};

exports.createNote = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating note" });
  }
};
