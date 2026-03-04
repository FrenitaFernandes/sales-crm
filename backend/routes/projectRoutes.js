const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  createProject,
  getProjects,
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
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.put("/:id/status", protect, updateProjectStatus);
router.delete("/:id", protect, deleteProject);

module.exports = router;