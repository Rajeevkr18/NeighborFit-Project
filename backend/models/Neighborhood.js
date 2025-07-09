/**
 * Neighborhood Model Schema
 * Comprehensive neighborhood data structure for matching algorithm
 */

const mongoose = require("mongoose")

const NeighborhoodSchema = new mongoose.Schema(
  {
    // Location identification
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    // Population and demographic data
    demographics: {
      population: Number,
      medianAge: Number,
      medianIncome: Number,
      educationLevel: String,
    },

    // Lifestyle scores used by matching algorithm (0-100 scale)
    lifestyle: {
      walkabilityScore: { type: Number, default: 0, min: 0, max: 100 },
      transitScore: { type: Number, default: 0, min: 0, max: 100 },
      bikeScore: { type: Number, default: 0, min: 0, max: 100 },
      crimeRate: { type: Number, default: 0 }, // Lower is better
      schoolRating: { type: Number, default: 0, min: 0, max: 10 },
    },

    // Count of various amenities in the area
    amenities: {
      restaurants: { type: Number, default: 0 },
      parks: { type: Number, default: 0 },
      gyms: { type: Number, default: 0 },
      shopping: { type: Number, default: 0 },
      nightlife: { type: Number, default: 0 },
      healthcare: { type: Number, default: 0 },
    },

    // Housing market data
    housing: {
      medianRent: Number,
      medianHomePrice: Number,
      rentPriceRange: {
        min: Number,
        max: Number,
      },
    },

    // Additional descriptive information
    description: String,
    tags: [String],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Geospatial index for location-based queries
NeighborhoodSchema.index({ coordinates: "2dsphere" })

module.exports = mongoose.model("Neighborhood", NeighborhoodSchema)
