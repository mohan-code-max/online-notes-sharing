const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const { getAllNotes, createNote } = require("../controllers/note-controller");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.get("/", auth, getAllNotes);
router.post("/", auth, upload.single("file"), createNote);

module.exports = router;
