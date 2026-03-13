const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const Advertisement = require("../models/Advertisement");

const parseFlexibleDate = (value) => {
  if (!value) return null;
  const raw = String(value).trim();

  const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;
    const parsed = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

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

const normalizeAudienceValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const AUDIENCE_ALIASES = {
  "Data Logger IIoT 4.0": ["datalogger", "dataloggeriiot40", "dataloggeriiot", "datalogger40", "datalogger4", "dataloggeriiot4"],
  "Cloud PLC 4.0": ["cloudplc", "cloudplc40", "plc40"],
  "Biometric Authentication": ["biometric", "biometricauth", "biometricauthentication"],
  "HMI & Display Board": ["hmi", "hmidisplayboard", "displayboard"],
  "RFID Reader": ["rfid", "rfidreader"],
  "R-LiFi": ["rlifi", "rlfi", "r-lifi", "lifi"],
  "Vibration Sensor": ["vibrationsensor", "vibration"],
  "Data Acquisition System": ["dataacquisitionsystem", "das"],
  "DAS Datalogger": ["dasdatalogger", "daslogger"]
};

const resolveCanonicalAudience = (audience) => {
  const normalizedTarget = normalizeAudienceValue(audience);
  if (!normalizedTarget) return "";

  for (const [canonical, aliases] of Object.entries(AUDIENCE_ALIASES)) {
    const normalizedCanonical = normalizeAudienceValue(canonical);
    if (normalizedTarget === normalizedCanonical || aliases.includes(normalizedTarget)) {
      return canonical;
    }
  }

  return String(audience || "").trim();
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

    const canonicalAudience = resolveCanonicalAudience(targetAudience);

    const derivedThumbnail =
      thumbnail ||
      PREFERENCE_IMAGE_MAP[String(canonicalAudience || "").trim()] ||
      "";

    const adTitle = String(productName || "").trim() || String(canonicalAudience || "").trim() || "Advertisement";

    // Validation
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required"
      });
    }

    const normalizedDate = parseFlexibleDate(date);
    if (!normalizedDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use yyyy-mm-dd."
      });
    }

    // Create Advertisement
    const ad = await Advertisement.create({
      date: normalizedDate,
      productName: adTitle,
      tagline,
      description,
      type,
      targetArea,
      targetAudience: canonicalAudience,
      thumbnail: derivedThumbnail
    });

    console.log("Advertisement Created:", productName);

    // ===========================
    // Find Target Customers
    // ===========================

    const baseCustomerQuery = { isDeleted: false };
    let customers = [];

    // Preference targeting takes priority over geography.
    // If targetAudience is selected, notify all matching preference customers regardless of targetArea.
    if (canonicalAudience && canonicalAudience !== "All") {
      const audienceKey = normalizeAudienceValue(canonicalAudience);
      customers = (await Customer.find(baseCustomerQuery)).filter((customer) => {
        const preferences = Array.isArray(customer.preferences) ? customer.preferences : [];

        const hasMatchingPreference = preferences.some(
          (pref) => normalizeAudienceValue(resolveCanonicalAudience(pref)) === audienceKey
        );

        const hasMatchingIndustry =
          normalizeAudienceValue(customer.industryType) === audienceKey;

        return hasMatchingPreference || hasMatchingIndustry;
      });
    } else {
      const customerQuery = { ...baseCustomerQuery };

      if (targetArea && targetArea !== "All") {
        customerQuery.country = { $regex: `^${targetArea}$`, $options: "i" };
      }

      customers = await Customer.find(customerQuery);
    }

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
      message: error?.message || "Server error"
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