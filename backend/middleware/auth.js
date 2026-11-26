const jwt = require("jsonwebtoken");
function requireAuth(req, res, next) {
  const token = req.cookies?.skillsprout_token;
  if (!token) return res.status(401).json({error:"Please log in to continue."});
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    res.clearCookie("skillsprout_token");
    return res.status(401).json({error:"Your session expired. Please log in again."});
  }
}
module.exports = { requireAuth };
