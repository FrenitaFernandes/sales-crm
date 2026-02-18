const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['Ongoing', 'Completed'], default: 'Ongoing' },
  startDate: Date,
  endDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
