const StockEntry = require("../models/StockEntry");
const StockUsage = require("../models/StockUsage");
const mongoose = require("mongoose");

// ===============================
// ADD STOCK ENTRY
// ===============================
exports.addStockEntry = async (req, res) => {
  try {
    const {
      itemName,
      quantity,
      unit,
      price,
      supplier,
      description,
      billNumber,
      category,
      date,
      items,
    } = req.body;

    if (Array.isArray(items) && items.length > 0) {
      const validItems = items.filter((item) =>
        item?.itemName && Number(item?.qty) > 0 && Number(item?.unitPrice) > 0
      );

      if (validItems.length === 0) {
        return res.status(400).json({ message: "At least one valid item is required" });
      }

      const docs = validItems.map((item) => ({
        itemName: String(item.itemName).trim(),
        quantity: Number(item.qty),
        unit: item.unit || "Nos",
        price: Number(item.unitPrice),
        supplier,
        description,
        billNumber,
        category: category || "None",
        entryDate: date || Date.now(),
      }));

      const createdEntries = await StockEntry.insertMany(docs);

      return res.status(201).json({
        success: true,
        message: "Stock entry added",
        data: createdEntries,
      });
    }

    if (!itemName || !quantity || !price) {
      return res.status(400).json({ message: "Item Name, Quantity & Price are required" });
    }

    const entry = await StockEntry.create({
      itemName,
      quantity,
      unit: unit || "Nos",
      price,
      supplier,
      description,
      billNumber,
      category: category || "None",
      entryDate: date || Date.now(),
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
    const entries = await StockEntry.find().sort({ createdAt: -1 });

    // Total stock used
    const usageItems = await StockUsage.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.itemName", totalUsed: { $sum: "$items.qtyUsed" } } }
    ]);

    const usageMap = {};
    usageItems.forEach(u => {
      usageMap[u._id] = u.totalUsed;
    });

    const entryMap = {};
    entries.forEach((entry) => {
      const key = entry.itemName;
      if (!entryMap[key]) {
        entryMap[key] = {
          itemName: key,
          category: entry.category || "None",
          totalAdded: 0,
          unitPrice: Number(entry.price) || 0,
        };
      }

      entryMap[key].totalAdded += Number(entry.quantity) || 0;
    });

    const summary = Object.values(entryMap).map((entry) => {
      const totalUsed = usageMap[entry.itemName] || 0;
      const availableQty = entry.totalAdded - totalUsed;

      return {
        itemName: entry.itemName,
        category: entry.category,
        totalAdded: entry.totalAdded,
        totalUsed,
        remaining: availableQty,
        availableQty,
        unitPrice: entry.unitPrice,
        totalValue: availableQty * entry.unitPrice,
      };
    });

    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error("Stock Summary Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// DELETE STOCK ENTRY
// ===============================
exports.deleteStockEntry = async (req, res) => {
  try {
    const requestedId = req.params.id || req.params.entryId;
    const bodyData = req.body || {};
    const queryData = req.query || {};

    const itemName = bodyData.itemName || queryData.itemName || (!mongoose.Types.ObjectId.isValid(requestedId) ? requestedId : "");
    const category = bodyData.category || queryData.category;
    const unitPrice = bodyData.unitPrice ?? queryData.unitPrice;

    let deleted = null;

    if (requestedId && mongoose.Types.ObjectId.isValid(requestedId)) {
      deleted = await StockEntry.findByIdAndDelete(requestedId);
    }

    if (!deleted && itemName) {
      const filter = {
        itemName: String(itemName).trim(),
      };

      if (category) {
        filter.category = String(category).trim();
      }

      if (Number(unitPrice) > 0) {
        filter.price = Number(unitPrice);
      }

      deleted = await StockEntry.findOneAndDelete(filter);
    }

    if (!deleted) {
      return res.status(404).json({ message: "Stock entry not found" });
    }

    res.status(200).json({
      success: true,
      message: "Stock entry deleted",
    });
  } catch (error) {
    console.error("Delete Stock Entry Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// UPDATE STOCK ENTRY
// ===============================
exports.updateStockEntry = async (req, res) => {
  try {
    const { itemName, quantity, unit, price, supplier, description, billNumber, category, date } = req.body;

    const updatePayload = {};
    if (itemName !== undefined) updatePayload.itemName = itemName;
    if (quantity !== undefined) updatePayload.quantity = Number(quantity);
    if (unit !== undefined) updatePayload.unit = unit || "Nos";
    if (price !== undefined) updatePayload.price = Number(price);
    if (supplier !== undefined) updatePayload.supplier = supplier;
    if (description !== undefined) updatePayload.description = description;
    if (billNumber !== undefined) updatePayload.billNumber = billNumber;
    if (category !== undefined) updatePayload.category = category || "None";
    if (date !== undefined) updatePayload.entryDate = date;

    const updated = await StockEntry.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Stock entry not found" });
    }

    res.status(200).json({
      success: true,
      message: "Stock entry updated",
      data: updated,
    });
  } catch (error) {
    console.error("Update Stock Entry Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};