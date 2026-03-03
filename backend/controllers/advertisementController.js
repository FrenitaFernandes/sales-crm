const Advertisement = require("../models/Advertisement");

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
      keywords,
      productLink,
      type,
      targetArea,
      targetAudience,
      thumbnail
    } = req.body;

    if (!date || !productName) {
      return res.status(400).json({ message: "Date and Product Name are required" });
    }

    const ad = await Advertisement.create({
      date,
      productName,
      tagline,
      description,
      keywords,
      productLink,
      type,
      targetArea,
      targetAudience,
      thumbnail
    });

    res.status(201).json({
      success: true,
      message: "Advertisement created successfully",
      data: ad
    });

  } catch (error) {
    console.error("Create Advertisement Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// GET ALL ADS
// ===========================
exports.getAdvertisements = async (req, res) => {
  try {
    const ads = await Advertisement.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ads.length,
      data: ads
    });

  } catch (error) {
    console.error("Get Advertisements Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// GET ONE AD
// ===========================
exports.getAdvertisementById = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    res.status(200).json({
      success: true,
      data: ad
    });

  } catch (error) {
    console.error("Get Advertisement Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// UPDATE AD
// ===========================
exports.updateAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    res.status(200).json({
      success: true,
      message: "Advertisement updated successfully",
      data: ad
    });

  } catch (error) {
    console.error("Update Advertisement Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// DELETE AD
// ===========================
exports.deleteAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndDelete(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    res.status(200).json({
      success: true,
      message: "Advertisement deleted successfully"
    });

  } catch (error) {
    console.error("Delete Advertisement Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};