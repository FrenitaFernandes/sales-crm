const ActivityLog = require("../models/ActivityLog");

exports.logActivity = async (userId, userName, action, module, description, ip) => {
  try {
    await ActivityLog.create({
      userId,
      userName,
      action,
      module,
      description,
      ipAddress: ip,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Activity Log Error:", error);
  }
};