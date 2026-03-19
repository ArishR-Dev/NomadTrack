const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Expected payload (new): { id, email, role }
    // Backward compatibility (old): { userId }
    const id = decoded.id ?? decoded.userId ?? null;
    req.user = {
      id,
      email: decoded.email,
      role: decoded.role,
    };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { authenticateToken };
