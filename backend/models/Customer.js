const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    lowercase: true
  },

  phone: {
    type: String
  },

  address: {
    type: String
  },

  city: {
    type: String
  },

  state: {
    type: String
  },

  country: {
    type: String
  },

  pincode: {
    type: String
  },

  company: {
    type: String
  },
  description: {
    type: String
  },
  website: {
    type: String
  },
  avatar: {
    type: String
  },

  industryType: {
    type: String,
    enum: [
      "Manufacturing Companies",
      "Industrial Businesses",
      "Smart Buildings",
      "Educational Institutions",
      "Technology Startups",
      "Automotive Companies",
      "Energy & Utility Companies",
      "Agriculture Technology Companies",
      "Logistics & Supply Chain Companies",
      "Retail Businesses",
      "Healthcare Organizations",
      "Government Organizations"
    ]
  },

  status: {
    type: String,
    enum: ["Active", "Inactive", "Suspended"],
    default: "Inactive"
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date,
    default: null
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);