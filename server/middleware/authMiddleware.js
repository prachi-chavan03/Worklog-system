const jwt = require('jsonwebtoken');

// Verify if the user is logged in
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Contains id and role
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

// Verify if the user is an Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { verifyToken, isAdmin };