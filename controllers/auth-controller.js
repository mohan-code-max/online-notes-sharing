const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

exports.register = async (req, res) => {
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
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid Username or Password" });

    const token = jwt.sign({ userId: user._id, username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error logging in" });
  }
};
