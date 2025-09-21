const express = require("express");
const router = express.Router();
const upload = require("../utils/multer-config");
const { getNotes, createNote, deleteNote } = require("../controllers/note-controller");
const auth = require("../middleware/auth-middleware");

router.get("/", auth, getNotes);
router.post("/", auth, upload.single("file"), createNote);
router.delete("/:id", auth, deleteNote);

module.exports = router;
