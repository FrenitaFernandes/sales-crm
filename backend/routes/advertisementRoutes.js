const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  createAdvertisement,
  getAdvertisements,
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement
} = require("../controllers/advertisementController");

const router = express.Router();

router.post("/", protect, createAdvertisement);
router.get("/", protect, getAdvertisements);
router.get("/:id", protect, getAdvertisementById);
router.put("/:id", protect, updateAdvertisement);
router.delete("/:id", protect, deleteAdvertisement);

module.exports = router;