const express = require("express")
const User = require("../models/User")
const Neighborhood = require("../models/Neighborhood")
const auth = require("../middleware/auth")

const router = express.Router()

// ============= GET USER PROFILE =============
/**
 * GET /api/users/profile
 * Get complete user profile including saved neighborhoods and match history
 * Requires authentication
 */
router.get("/profile", auth, async (req, res) => {
  try {
    // Find user and populate related data
    const user = await User.findById(req.user.id)
      .select("-password") // Exclude password from response
      .populate("savedNeighborhoods") // Include full neighborhood data for saved items
      .populate("matchHistory.neighborhoodId") // Include neighborhood data in match history

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Get user profile error:", error.message)
    res.status(500).send("Server error while fetching user profile")
  }
})

// ============= UPDATE USER PROFILE =============
/**
 * PUT /api/users/profile
 * Update user's basic information and preferences
 * Body: { name, preferences }
 */
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, preferences } = req.body

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Name is required" })
    }

    // Update user with new data
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name.trim(), // Remove extra whitespace
        preferences,
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validation
      },
    ).select("-password") // Exclude password from response

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Update user profile error:", error.message)
    res.status(500).send("Server error while updating profile")
  }
})

// ============= SAVE NEIGHBORHOOD =============
/**
 * POST /api/users/save-neighborhood/:id
 * Add a neighborhood to user's saved list
 * Params: id (neighborhood ID)
 */
router.post("/save-neighborhood/:id", auth, async (req, res) => {
  try {
    // Verify neighborhood exists
    const neighborhood = await Neighborhood.findById(req.params.id)
    if (!neighborhood) {
      return res.status(404).json({ message: "Neighborhood not found" })
    }

    // Get current user
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if neighborhood is already saved
    if (user.savedNeighborhoods.includes(req.params.id)) {
      return res.status(400).json({ message: "Neighborhood already saved" })
    }

    // Add neighborhood to saved list
    user.savedNeighborhoods.push(req.params.id)
    await user.save()

    res.json({
      message: "Neighborhood saved successfully",
      savedCount: user.savedNeighborhoods.length,
    })
  } catch (error) {
    console.error("Save neighborhood error:", error.message)
    res.status(500).send("Server error while saving neighborhood")
  }
})

// ============= REMOVE SAVED NEIGHBORHOOD =============
/**
 * DELETE /api/users/save-neighborhood/:id
 * Remove a neighborhood from user's saved list
 * Params: id (neighborhood ID)
 */
router.delete("/save-neighborhood/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if neighborhood is in saved list
    if (!user.savedNeighborhoods.includes(req.params.id)) {
      return res.status(400).json({ message: "Neighborhood not in saved list" })
    }

    // Remove neighborhood from saved list
    user.savedNeighborhoods = user.savedNeighborhoods.filter((id) => id.toString() !== req.params.id)
    await user.save()

    res.json({
      message: "Neighborhood removed from saved list",
      savedCount: user.savedNeighborhoods.length,
    })
  } catch (error) {
    console.error("Remove saved neighborhood error:", error.message)
    res.status(500).send("Server error while removing saved neighborhood")
  }
})

// ============= GET SAVED NEIGHBORHOODS =============
/**
 * GET /api/users/saved-neighborhoods
 * Get all neighborhoods saved by the user
 */
router.get("/saved-neighborhoods", auth, async (req, res) => {
  try {
    // Get user with populated saved neighborhoods
    const user = await User.findById(req.user.id).populate("savedNeighborhoods").select("savedNeighborhoods")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      savedNeighborhoods: user.savedNeighborhoods,
      count: user.savedNeighborhoods.length,
    })
  } catch (error) {
    console.error("Get saved neighborhoods error:", error.message)
    res.status(500).send("Server error while fetching saved neighborhoods")
  }
})

// ============= GET MATCH HISTORY =============
/**
 * GET /api/users/match-history
 * Get user's neighborhood matching history
 * Query params: limit (default 20)
 */
router.get("/match-history", auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query

    // Get user with populated match history
    const user = await User.findById(req.user.id).populate("matchHistory.neighborhoodId").select("matchHistory")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Sort match history by timestamp (most recent first) and limit results
    const sortedHistory = user.matchHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, Number.parseInt(limit))

    res.json({
      matchHistory: sortedHistory,
      count: sortedHistory.length,
      totalMatches: user.matchHistory.length,
    })
  } catch (error) {
    console.error("Get match history error:", error.message)
    res.status(500).send("Server error while fetching match history")
  }
})

// ============= UPDATE USER PREFERENCES ONLY =============
/**
 * PUT /api/users/preferences
 * Update only user preferences (separate from profile update)
 * Body: preferences object
 */
router.put("/preferences", auth, async (req, res) => {
  try {
    const preferences = req.body

    // Validate preferences structure
    if (!preferences || typeof preferences !== "object") {
      return res.status(400).json({ message: "Valid preferences object is required" })
    }

    // Update user preferences
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validation
      },
    ).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      message: "Preferences updated successfully",
      preferences: user.preferences,
    })
  } catch (error) {
    console.error("Update preferences error:", error.message)
    res.status(500).send("Server error while updating preferences")
  }
})

module.exports = router
