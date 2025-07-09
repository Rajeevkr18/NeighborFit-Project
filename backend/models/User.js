/**
 * User Model Schema
 * Defines user structure with authentication, preferences, and interaction history
 */

const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
  {
    // Basic user information
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // User lifestyle and housing preferences
    preferences: {
      lifestyle: {
        type: String,
        enum: ["urban", "suburban", "rural"],
        default: "suburban",
      },
      budget: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 1000000 },
      },
      // User's priority factors for neighborhood matching
      priorities: [
        {
          type: String,
          enum: ["walkability", "schools", "safety", "nightlife", "parks", "transit", "shopping", "restaurants"],
        },
      ],
      familySize: {
        type: Number,
        default: 1,
      },
      hasChildren: {
        type: Boolean,
        default: false,
      },
      // Work location for commute calculations
      workLocation: {
        lat: Number,
        lng: Number,
        address: String,
      },
    },

    // User interactions and history
    savedNeighborhoods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Neighborhood",
      },
    ],
    matchHistory: [
      {
        neighborhoodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Neighborhood",
        },
        score: Number,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("User", UserSchema)
