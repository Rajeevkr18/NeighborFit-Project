/**
 * Neighborhood Routes
 * API endpoints for neighborhood data retrieval and search functionality
 */

const express = require("express")
const Neighborhood = require("../models/Neighborhood")

const router = express.Router()

// Get paginated neighborhoods with optional filtering
router.get("/", async (req, res) => {
  try {
    const { city, state, limit = 20, page = 1 } = req.query

    // Build query filters
    const query = {}
    if (city) query.city = new RegExp(city, "i")
    if (state) query.state = new RegExp(state, "i")

    // Execute paginated query
    const neighborhoods = await Neighborhood.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 })

    const total = await Neighborhood.countDocuments(query)

    res.json({
      neighborhoods,
      totalPages: Math.ceil(total / limit),
      currentPage: Number.parseInt(page),
      total,
    })
  } catch (error) {
    console.error("Get neighborhoods error:", error.message)
    res.status(500).send("Server error while fetching neighborhoods")
  }
})

// Get specific neighborhood by ID
router.get("/:id", async (req, res) => {
  try {
    const neighborhood = await Neighborhood.findById(req.params.id)
    if (!neighborhood) {
      return res.status(404).json({ message: "Neighborhood not found" })
    }
    res.json(neighborhood)
  } catch (error) {
    console.error("Get neighborhood by ID error:", error.message)
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Neighborhood not found" })
    }
    res.status(500).send("Server error while fetching neighborhood")
  }
})

// Geographic proximity search
router.get("/search/location", async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" })
    }

    // MongoDB geospatial query for nearby neighborhoods
    const neighborhoods = await Neighborhood.find({
      coordinates: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number.parseFloat(lng), Number.parseFloat(lat)],
          },
          $maxDistance: radius * 1609.34, // Convert miles to meters
        },
      },
    }).limit(20)

    res.json(neighborhoods)
  } catch (error) {
    console.error("Location search error:", error.message)
    res.status(500).send("Server error during location search")
  }
})

// Text-based search across multiple fields
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params

    const neighborhoods = await Neighborhood.find({
      $or: [
        { name: new RegExp(query, "i") },
        { city: new RegExp(query, "i") },
        { tags: { $in: [new RegExp(query, "i")] } },
        { description: new RegExp(query, "i") },
      ],
    }).limit(20)

    res.json(neighborhoods)
  } catch (error) {
    console.error("Text search error:", error.message)
    res.status(500).send("Server error during text search")
  }
})

module.exports = router
