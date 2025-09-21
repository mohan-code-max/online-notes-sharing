const express = require("express");
const router = express.Router();
const { login, getNotes, deleteNote } = require("../controllers/admin-controller");
const adminAuth = require("../middleware/admin-middleware");

router.post("/login", login);
router.get("/notes", adminAuth, getNotes);
router.delete("/notes/:id", adminAuth, deleteNote);

module.exports = router;
