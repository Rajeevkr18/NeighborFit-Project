/**
 * JWT Authentication Middleware
 * Verifies tokens and protects routes requiring authentication
 */

const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
  const token = req.header("x-auth-token")

  if (!token) {
    return res.status(401).json({ message: "No token provided, authorization denied" })
  }

  try {
    // Verify token and extract user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded.user
    next()
  } catch (error) {
    console.error("Token verification failed:", error.message)
    res.status(401).json({ message: "Token is not valid" })
  }
}
