const Notification = require("../models/Notification");
const Customer = require("../models/Customer");


// ===========================
// GET CUSTOMER NOTIFICATIONS
// ===========================
exports.getCustomerNotifications = async (req, res) => {
  try {

    // Logged-in user id
    const userId = req.user.id;

    // Find customer profile linked with this user
    const customer = await Customer.findOne({ userId });

    if (!customer) {
      return res.status(404).json({
        message: "Customer profile not found"
      });
    }

    const notifications = await Notification
      .find({ customerId: customer._id })
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

    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
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