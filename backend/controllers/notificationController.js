const Notification = require("../models/Notification");
const Customer = require("../models/Customer");


// ===========================
// GET CUSTOMER NOTIFICATIONS
// ===========================
exports.getCustomerNotifications = async (req, res) => {
  try {

    // Logged-in user id
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Find customer profile linked with this user (supports older records without userId).
    const customers = await Customer.find({
      $or: [
        { userId },
        { email: userEmail }
      ]
    }).select("_id");

    if (!customers || customers.length === 0) {
      return res.status(404).json({
        message: "Customer profile not found"
      });
    }

    const customerIds = customers.map((c) => c._id);

    const notifications = await Notification
      .find({ customerId: { $in: customerIds } })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });

  } catch (error) {

    console.error("Get Notifications Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};



// ===========================
// MARK NOTIFICATION AS READ
// ===========================
exports.markNotificationRead = async (req, res) => {

  try {

    const userId = req.user.id;
    const userEmail = req.user.email;

    const customers = await Customer.find({
      $or: [
        { userId },
        { email: userEmail }
      ]
    }).select("_id");

    if (!customers || customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found"
      });
    }

    const customerIds = customers.map((c) => c._id);

    const notif = await Notification.findByIdAndUpdate(
      { _id: req.params.id, customerId: { $in: customerIds } },
      { read: true },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });

  } catch (error) {

    console.error("Mark Notification Read Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};