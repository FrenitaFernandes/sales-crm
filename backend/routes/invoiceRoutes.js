const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  getInvoicesByCustomer
} = require("../controllers/invoiceController");

const router = express.Router();

router.post("/", protect, createInvoice);
router.get("/", protect, getInvoices);
router.get("/customer/:customerId", protect, getInvoicesByCustomer);
router.get("/:id", protect, getInvoiceById);
router.put("/:id", protect, updateInvoice);
router.put("/:id/status", protect, updateInvoiceStatus);
router.delete("/:id", protect, deleteInvoice);

module.exports = router;