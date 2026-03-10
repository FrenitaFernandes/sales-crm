const ActivityLog = require("../models/ActivityLog");

// =============================
// GET ALL LOGS
// =============================
exports.getActivityLogs = async (req, res) => {
  try {
    if (req.query.groupBy === "date") {
      const groupedLogs = await ActivityLog.aggregate([
        {
          $addFields: {
            activityAt: { $ifNull: ["$timestamp", "$createdAt"] }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$activityAt"
              }
            },
            totalActivities: { $sum: 1 },
            createCount: {
              $sum: {
                $cond: [{ $eq: [{ $toUpper: { $ifNull: ["$action", ""] } }, "CREATE"] }, 1, 0]
              }
            },
            updateCount: {
              $sum: {
                $cond: [{ $eq: [{ $toUpper: { $ifNull: ["$action", ""] } }, "UPDATE"] }, 1, 0]
              }
            },
            deleteCount: {
              $sum: {
                $cond: [{ $eq: [{ $toUpper: { $ifNull: ["$action", ""] } }, "DELETE"] }, 1, 0]
              }
            },
            uniqueUsers: { $addToSet: "$userName" },
            latestActivityAt: { $max: "$activityAt" }
          }
        },
        { $sort: { _id: -1 } }
      ]);

      const data = groupedLogs.map((row) => ({
        date: row._id,
        totalActivities: row.totalActivities,
        createCount: row.createCount,
        updateCount: row.updateCount,
        deleteCount: row.deleteCount,
        usersCount: (row.uniqueUsers || []).filter(Boolean).length,
        latestActivityAt: row.latestActivityAt,
      }));

      return res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    }

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