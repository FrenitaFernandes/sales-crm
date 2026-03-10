const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  createProject,
  getProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

// create a new project. frontend may hit '/create' or '/' – both map to the same handler
router.post("/", protect, createProject);
router.post("/create", protect, createProject);
router.get("/", protect, getProjects);
router.get("/my-projects", protect, getMyProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.put("/:id/status", protect, updateProjectStatus);
router.delete("/:id", protect, deleteProject);

// debug route: list phone values
router.get("/debug-phones", protect, async (req, res) => {
  try {
    const projects = await require("../models/Project").find().populate("customerId", "name phone");
    const debug = projects.map(p => ({
      _id: p._id,
      projectPhone: p.phone || null,
      customerPhone: p.customerId?.phone || null,
      customerName: p.customerId?.name || null
    }));
    res.status(200).json({ success: true, count: debug.length, data: debug });
  } catch (err) {
    console.error("Debug phones error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;