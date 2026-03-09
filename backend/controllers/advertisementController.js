const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const Advertisement = require("../models/Advertisement");

const PREFERENCE_IMAGE_MAP = {
  "Data Logger IIoT 4.0": "/DataLogger.png",
  "Cloud PLC 4.0": "/CloudPLC.png",
  "Biometric Authentication": "/Biometric.png",
  "HMI & Display Board": "/HMI.png",
  "RFID Reader": "/RFID.png",
  "R-LiFi": "/R-LiFi.png",
  "Vibration Sensor": "/VibrationSensor.png",
  "Data Acquisition System": "/DataAcquistion.png",
  "DAS Datalogger": "/DAS_Datalogger.png"
};


// ===========================
// CREATE ADVERTISEMENT
// ===========================
exports.createAdvertisement = async (req, res) => {
  try {

    const {
      date,
      productName,
      tagline,
      description,
      type,
      targetArea,
      targetAudience,
      thumbnail
    } = req.body;

    const derivedThumbnail =
      thumbnail ||
      PREFERENCE_IMAGE_MAP[String(targetAudience || "").trim()] ||
      "";

    const adTitle = String(productName || "").trim() || String(targetAudience || "").trim() || "Advertisement";

    // Validation
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required"
      });
    }

    // Create Advertisement
    const ad = await Advertisement.create({
      date,
      productName,
      tagline,
      description,
      type,
      targetArea,
      targetAudience,
      thumbnail: derivedThumbnail
    });

    console.log("Advertisement Created:", productName);

    // ===========================
    // Find Target Customers
    // ===========================

    let customerQuery = {};

    if (targetArea && targetArea !== "All") {
      customerQuery.country = { $regex: `^${targetArea}$`, $options: "i" };
    }

    if (targetAudience && targetAudience !== "All") {
      customerQuery.$or = [
        { preferences: { $in: [targetAudience] } },
        { industryType: { $regex: `^${targetAudience}$`, $options: "i" } }
      ];
    }

    const customers = await Customer.find(customerQuery);

    console.log("Matching Customers Found:", customers.length);

    // ===========================
    // Create Notifications
    // ===========================

    if (customers.length > 0) {

      const notifications = customers.map((customer) => ({
        customerId: customer._id,
        title: adTitle,
        message: tagline || description,
        type: "advertisement",
        image: ad.thumbnail || "",
        read: false
      }));

      await Notification.insertMany(notifications);

      console.log("Notifications Sent:", notifications.length);

    } else {

      console.log("No customers matched advertisement targeting");

    }

    res.status(201).json({
      success: true,
      message: "Advertisement created successfully",
      advertisement: ad,
      targetedCustomers: customers.length
    });

  } catch (error) {

    console.error("Create Advertisement Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


// ===========================
// GET ALL ADVERTISEMENTS
// ===========================
exports.getAdvertisements = async (req, res) => {
  try {

    const ads = await Advertisement
      .find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ads.length,
      data: ads
    });

  } catch (error) {

    console.error("Get Advertisements Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


// ===========================
// GET SINGLE ADVERTISEMENT
// ===========================
exports.getAdvertisementById = async (req, res) => {
  try {

    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found"
      });
    }

    res.status(200).json({
      success: true,
      data: ad
    });

  } catch (error) {

    console.error("Get Advertisement Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


// ===========================
// UPDATE ADVERTISEMENT
// ===========================
exports.updateAdvertisement = async (req, res) => {
  try {

    const ad = await Advertisement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Advertisement updated successfully",
      data: ad
    });

  } catch (error) {

    console.error("Update Advertisement Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


// ===========================
// DELETE ADVERTISEMENT
// ===========================
exports.deleteAdvertisement = async (req, res) => {
  try {

    const ad = await Advertisement.findByIdAndDelete(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Advertisement deleted successfully"
    });

  } catch (error) {

    console.error("Delete Advertisement Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};