const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  projectName: { type: String },
  title: { type: String },
  clientName: { type: String },
  description: { type: String },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'on-hold', 'cancelled', 'Ongoing', 'Completed'],
    default: 'ongoing'
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  budget: { type: Number },
  assignedTo: { type: String },
  progress: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

// Keep compatibility: if one of `title` or `projectName` is set, ensure the other is synced
ProjectSchema.pre('save', function (next) {
  if (!this.projectName && this.title) this.projectName = this.title;
  if (!this.title && this.projectName) this.title = this.projectName;
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
