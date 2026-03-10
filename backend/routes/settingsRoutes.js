const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getAdminSettings,
  updateAdminProfile,
  changeAdminPassword,
  updateCompanySettings,
  exportCustomersCsv,
  exportProjectsCsv,
  exportInvoicesCsv,
} = require("../controllers/settingsController");

const router = express.Router();

router.use(protect);

router.get("/admin", getAdminSettings);
router.put("/admin/profile", updateAdminProfile);
router.put("/admin/password", changeAdminPassword);
router.put("/admin/company", updateCompanySettings);

router.get("/admin/export/customers", exportCustomersCsv);
router.get("/admin/export/projects", exportProjectsCsv);
router.get("/admin/export/invoices", exportInvoicesCsv);

module.exports = router;
