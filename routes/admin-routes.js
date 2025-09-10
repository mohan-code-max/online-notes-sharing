const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/auth-admin");
const { adminLogin, getNotes, deleteNote } = require("../controllers/admin-controller");

router.post("/login", adminLogin);
router.get("/notes", adminAuth, getNotes);
router.delete("/notes/:id", adminAuth, deleteNote);

module.exports = router;
