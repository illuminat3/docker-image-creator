const crypto = require("crypto");

module.exports = function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  // Constant-time comparison to prevent timing attacks
  const expected = Buffer.from(process.env.API_PASSWORD);
  const provided = Buffer.from(token);

  if (
    expected.length !== provided.length ||
    !crypto.timingSafeEqual(expected, provided)
  ) {
    return res.status(401).json({ error: "Invalid password" });
  }

  next();
};
