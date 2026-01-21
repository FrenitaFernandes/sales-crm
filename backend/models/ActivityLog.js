const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    module: String,
    action: String,
    user: String,
    date: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
