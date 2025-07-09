/**
 * Database Seeding Script
 * Populates the database with sample neighborhood data for testing and development
 * Run this script to add realistic neighborhood data to your MongoDB database
 */

const mongoose = require("mongoose")
const Neighborhood = require("../models/Neighborhood")
require("dotenv").config()

// ============= SAMPLE NEIGHBORHOOD DATA =============
// Realistic neighborhood data for major US cities
const sampleNeighborhoods = [
  {
    name: "Greenwich Village",
    city: "New York",
    state: "NY",
    coordinates: { lat: 40.7335, lng: -74.0027 },
    demographics: {
      population: 22785,
      medianAge: 36,
      medianIncome: 85000,
      educationLevel: "Graduate Degree",
    },
    lifestyle: {
      walkabilityScore: 98, // Excellent walkability
      transitScore: 95, // Great public transit
      bikeScore: 85, // Very bike-friendly
      crimeRate: 15, // Low crime rate
      schoolRating: 8, // Good schools
    },
    amenities: {
      restaurants: 150, // Lots of dining options
      parks: 8, // Several parks
      gyms: 12, // Fitness options
      shopping: 25, // Shopping venues
      nightlife: 45, // Active nightlife
      healthcare: 8, // Medical facilities
    },
    housing: {
      medianRent: 3500,
      medianHomePrice: 1200000,
      rentPriceRange: { min: 2000, max: 8000 },
    },
    description:
      "Historic neighborhood known for its bohemian culture, tree-lined streets, and vibrant arts scene. Home to Washington Square Park and NYU.",
    tags: ["urban", "walkable", "nightlife", "cultural", "expensive", "historic"],
  },

  {
    name: "Lower East Side",
    city: "New York",
    state: "NY",
    coordinates: { lat: 40.7128, lng: -73.9857 },
    demographics: {
      population: 16500,
      medianAge: 32,
      medianIncome: 60000,
      educationLevel: "Bachelor's Degree",
    },
    lifestyle: {
      walkabilityScore: 97,
      transitScore: 90,
      bikeScore: 80,
      crimeRate: 20,
      schoolRating: 7,
    },
    amenities: {
      restaurants: 120,
      parks: 5,
      gyms: 10,
      shopping: 20,
      nightlife: 35,
      healthcare: 7,
    },
    housing: {
      medianRent: 2800,
      medianHomePrice: 900000,
      rentPriceRange: { min: 1500, max: 6000 },
    },
    description: "Neighborhood known for its diverse immigrant population, historic tenements, and street art.",
    tags: ["urban", "walkable", "diverse", "historic", "affordable"],
  },

  // Additional neighborhoods would follow the same pattern...
  // Including suburban, rural, and various urban neighborhoods
  // across different cities and price points
]

/**
 * Main seeding function
 * Connects to database, clears existing data, and inserts sample neighborhoods
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/neighborfit")
    console.log("Connected to MongoDB")

    // Clear existing neighborhood data
    await Neighborhood.deleteMany({})
    console.log("Cleared existing neighborhoods")

    // Insert sample data
    await Neighborhood.insertMany(sampleNeighborhoods)
    console.log(`✅ Successfully seeded ${sampleNeighborhoods.length} neighborhoods`)

    process.exit(0)
  } catch (error) {
    console.error("❌ Seeding error:", error)
    process.exit(1)
  }
}

// Run the seeding process
seedDatabase()
