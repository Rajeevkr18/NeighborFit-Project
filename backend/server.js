/**
 * NeighborFit Backend Server
 * Main server configuration with Express, MongoDB, and API routes
 */

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()
const app = express()

// Middleware configuration
app.use(cors())
app.use(express.json())

// API Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/neighborhoods", require("./routes/neighborhoods"))
app.use("/api/users", require("./routes/users"))
app.use("/api/matching", require("./routes/matching"))

// MongoDB connection with error handling
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/neighborfit", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB connection error:", err))

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "NeighborFit API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
