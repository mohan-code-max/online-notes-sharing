const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, admin) => {
    if (err || !admin.admin)
      return res.status(403).json({ msg: "Unauthorized" });
    req.admin = admin;
    next();
  });
};
