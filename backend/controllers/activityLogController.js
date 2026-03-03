const ActivityLog = require("../models/ActivityLog");

// =============================
// GET ALL LOGS
// =============================
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });

  } catch (error) {
    console.error("Get Logs Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// GET SINGLE LOG
// =============================
exports.getActivityLogById = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.status(200).json({
      success: true,
      data: log
    });

  } catch (error) {
    console.error("Get Log Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// DELETE ONE LOG
// =============================
exports.deleteActivityLog = async (req, res) => {
  try {
    const log = await ActivityLog.findByIdAndDelete(req.params.id);

    if (!log) return res.status(404).json({ message: "Log not found" });

    res.status(200).json({
      success: true,
      message: "Log deleted successfully"
    });

  } catch (error) {
    console.error("Delete Log Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// CLEAR ALL LOGS
// =============================
exports.clearActivityLogs = async (req, res) => {
  try {
    await ActivityLog.deleteMany();

    res.status(200).json({
      success: true,
      message: "All logs cleared"
    });

  } catch (error) {
    console.error("Clear Logs Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};