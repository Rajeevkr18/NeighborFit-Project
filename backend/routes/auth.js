/**
 * Authentication Routes
 * Handles user registration, login, and token verification
 */

const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// User registration endpoint
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check for existing user
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Create and hash password
    user = new User({ name, email, password })
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
    await user.save()

    // Generate JWT token
    const payload = { user: { id: user.id } }
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err
      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
      })
    })
  } catch (error) {
    console.error("Registration error:", error.message)
    res.status(500).send("Server error during registration")
  }
})

// User login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate user credentials
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const payload = { user: { id: user.id } }
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          preferences: user.preferences,
        },
      })
    })
  } catch (error) {
    console.error("Login error:", error.message)
    res.status(500).send("Server error during login")
  }
})

// Get current authenticated user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (error) {
    console.error("Get current user error:", error.message)
    res.status(500).send("Server error")
  }
})

module.exports = router
