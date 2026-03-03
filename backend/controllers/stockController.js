const StockEntry = require("../models/StockEntry");
const StockUsage = require("../models/StockUsage");

// ===============================
// ADD STOCK ENTRY
// ===============================
exports.addStockEntry = async (req, res) => {
  try {
    const { itemName, quantity, unit, price, supplier, description } = req.body;

    if (!itemName || !quantity || !unit || !price) {
      return res.status(400).json({ message: "Item Name, Quantity, Unit & Price are required" });
    }

    const entry = await StockEntry.create({
      itemName,
      quantity,
      unit,
      price,
      supplier,
      description
    });

    res.status(201).json({
      success: true,
      message: "Stock entry added",
      data: entry
    });
  } catch (error) {
    console.error("Add Stock Entry Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// ADD STOCK USAGE
// ===============================
exports.addStockUsage = async (req, res) => {
  try {
    const { project, date, items } = req.body;

    if (!project || !items || items.length === 0) {
      return res.status(400).json({ message: "Project and items are required" });
    }

    // Calculate total used amount
    const totalUsed = items.reduce((acc, item) => acc + (item.total || 0), 0);

    const usage = await StockUsage.create({
      project,
      date,
      items,
      totalUsed
    });

    res.status(201).json({
      success: true,
      message: "Stock usage recorded",
      data: usage
    });

  } catch (error) {
    console.error("Add Stock Usage Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET ALL STOCK ENTRIES
// ===============================
exports.getStockEntries = async (req, res) => {
  try {
    const entries = await StockEntry.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    console.error("Get Stock Entries Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET ALL STOCK USAGE
// ===============================
exports.getStockUsage = async (req, res) => {
  try {
    const usage = await StockUsage.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: usage.length,
      data: usage
    });
  } catch (error) {
    console.error("Get Stock Usage Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET STOCK SUMMARY (Remaining Stock)
// ===============================
exports.getStockSummary = async (req, res) => {
  try {
    // Total stock added
    const entries = await StockEntry.aggregate([
      { $group: { _id: "$itemName", totalAdded: { $sum: "$quantity" } } }
    ]);

    // Total stock used
    const usageItems = await StockUsage.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.itemName", totalUsed: { $sum: "$items.qtyUsed" } } }
    ]);

    const usageMap = {};
    usageItems.forEach(u => {
      usageMap[u._id] = u.totalUsed;
    });

    // final summary
    const summary = entries.map(entry => ({
      itemName: entry._id,
      totalAdded: entry.totalAdded,
      totalUsed: usageMap[entry._id] || 0,
      remaining: entry.totalAdded - (usageMap[entry._id] || 0)
    }));

    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error("Stock Summary Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};