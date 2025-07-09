/**
 * Neighborhood Matching Routes
 * Core matching algorithm and user preference handling
 */

const express = require("express")
const User = require("../models/User")
const Neighborhood = require("../models/Neighborhood")
const auth = require("../middleware/auth")

const router = express.Router()

/**
 * Core matching algorithm - calculates compatibility score between user and neighborhood
 * Uses weighted scoring based on user priorities and neighborhood attributes
 */
const calculateMatchScore = (userPreferences, neighborhood) => {
  let score = 0
  let maxScore = 0

  const priorities = userPreferences.priorities || []
  const weights = {
    walkability: 0.2,
    schools: 0.15,
    safety: 0.2,
    nightlife: 0.1,
    parks: 0.1,
    transit: 0.15,
    shopping: 0.05,
    restaurants: 0.05,
  }

  // Calculate weighted scores for each user priority
  priorities.forEach((priority) => {
    const weight = weights[priority] || 0.1
    maxScore += weight * 100

    switch (priority) {
      case "walkability":
        score += (neighborhood.lifestyle.walkabilityScore || 0) * weight
        break
      case "schools":
        score += (neighborhood.lifestyle.schoolRating || 0) * 10 * weight
        break
      case "safety":
        const safetyScore = Math.max(0, 100 - (neighborhood.lifestyle.crimeRate || 50))
        score += safetyScore * weight
        break
      case "nightlife":
        score += Math.min(100, (neighborhood.amenities.nightlife || 0) * 10) * weight
        break
      case "parks":
        score += Math.min(100, (neighborhood.amenities.parks || 0) * 5) * weight
        break
      case "transit":
        score += (neighborhood.lifestyle.transitScore || 0) * weight
        break
      case "shopping":
        score += Math.min(100, (neighborhood.amenities.shopping || 0) * 5) * weight
        break
      case "restaurants":
        score += Math.min(100, (neighborhood.amenities.restaurants || 0) * 2) * weight
        break
    }
  })

  // Budget compatibility adjustment
  if (userPreferences.budget && neighborhood.housing) {
    const userMaxBudget = userPreferences.budget.max
    const neighborhoodMedianRent = neighborhood.housing.medianRent || 0

    if (neighborhoodMedianRent <= userMaxBudget) {
      score += 20
    } else {
      score -= Math.min(30, ((neighborhoodMedianRent - userMaxBudget) / userMaxBudget) * 100)
    }
    maxScore += 20
  }

  // Normalize to 0-100 scale
  return maxScore > 0 ? Math.min(100, Math.max(0, (score / maxScore) * 100)) : 0
}

// Generate neighborhood matches for authenticated user
router.get("/matches", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Validate user has set preferences
    if (!user.preferences || !user.preferences.priorities || user.preferences.priorities.length === 0) {
      return res.status(400).json({
        message: "Please set your preferences first to get matches",
        needsPreferences: true,
      })
    }

    const { limit = 10, city, state } = req.query

    // Apply location filters if provided
    const query = {}
    if (city) query.city = new RegExp(city, "i")
    if (state) query.state = new RegExp(state, "i")

    const neighborhoods = await Neighborhood.find(query)

    // Calculate match scores and generate reasons
    const matches = neighborhoods.map((neighborhood) => {
      const score = calculateMatchScore(user.preferences, neighborhood)
      return {
        neighborhood,
        score: Math.round(score),
        reasons: generateMatchReasons(user.preferences, neighborhood, score),
      }
    })

    // Sort by score and limit results
    const sortedMatches = matches.sort((a, b) => b.score - a.score).slice(0, Number.parseInt(limit))

    // Update user's match history
    const matchHistory = sortedMatches.map((match) => ({
      neighborhoodId: match.neighborhood._id,
      score: match.score,
      timestamp: new Date(),
    }))

    await User.findByIdAndUpdate(req.user.id, {
      $push: { matchHistory: { $each: matchHistory.slice(0, 5) } },
    })

    res.json(sortedMatches)
  } catch (error) {
    console.error("Generate matches error:", error.message)
    res.status(500).send("Server error while generating matches")
  }
})

/**
 * Generate human-readable reasons for match scores
 * Helps users understand why neighborhoods were recommended
 */
const generateMatchReasons = (preferences, neighborhood, score) => {
  const reasons = []

  // Overall score assessment
  if (score >= 80) {
    reasons.push("Excellent overall match for your lifestyle")
  } else if (score >= 60) {
    reasons.push("Good match with some great features")
  } else if (score >= 40) {
    reasons.push("Decent match with room for compromise")
  } else {
    reasons.push("Limited match - consider adjusting preferences")
  }

  // Specific feature highlights
  if (neighborhood.lifestyle.walkabilityScore >= 70) {
    reasons.push("High walkability score - easy to get around on foot")
  }
  if (neighborhood.lifestyle.schoolRating >= 8) {
    reasons.push("Excellent schools in the area")
  }
  if (neighborhood.lifestyle.crimeRate <= 20) {
    reasons.push("Very safe neighborhood with low crime rates")
  }
  if (neighborhood.lifestyle.transitScore >= 70) {
    reasons.push("Great public transportation access")
  }
  if (neighborhood.amenities.restaurants >= 20) {
    reasons.push("Lots of dining options nearby")
  }
  if (neighborhood.amenities.parks >= 5) {
    reasons.push("Plenty of parks and green spaces")
  }

  return reasons
}

// Update user preferences
router.put("/preferences", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { preferences: req.body }, { new: true }).select("-password")
    res.json(user)
  } catch (error) {
    console.error("Update preferences error:", error.message)
    res.status(500).send("Server error while updating preferences")
  }
})

// Detailed match analysis for specific neighborhood
router.get("/analyze/:neighborhoodId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const neighborhood = await Neighborhood.findById(req.params.neighborhoodId)

    if (!neighborhood) {
      return res.status(404).json({ message: "Neighborhood not found" })
    }

    const score = calculateMatchScore(user.preferences, neighborhood)
    const reasons = generateMatchReasons(user.preferences, neighborhood, score)

    // Detailed breakdown of how each factor scored
    const analysis = {
      overallScore: Math.round(score),
      neighborhood: neighborhood,
      reasons: reasons,
      breakdown: {
        priorities: user.preferences.priorities.map((priority) => ({
          factor: priority,
          importance: "High",
          neighborhoodScore: getFactorScore(priority, neighborhood),
        })),
      },
    }

    res.json(analysis)
  } catch (error) {
    console.error("Match analysis error:", error.message)
    res.status(500).send("Server error during match analysis")
  }
})

// Helper function to get individual factor scores
const getFactorScore = (factor, neighborhood) => {
  switch (factor) {
    case "walkability":
      return neighborhood.lifestyle.walkabilityScore || 0
    case "schools":
      return (neighborhood.lifestyle.schoolRating || 0) * 10
    case "safety":
      return Math.max(0, 100 - (neighborhood.lifestyle.crimeRate || 50))
    case "transit":
      return neighborhood.lifestyle.transitScore || 0
    default:
      return 0
  }
}

module.exports = router
