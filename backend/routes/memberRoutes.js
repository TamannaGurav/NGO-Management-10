const express = require("express");
const router = express.Router();
const { getMembers, updateMember, deleteMember } = require("../controllers/memberController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authorize");

// Only an admin can manage members of their NGO.
router.get("/", protect, authorize("admin"), getMembers);
router.put("/:id", protect, authorize("admin"), updateMember);
router.delete("/:id", protect, authorize("admin"), deleteMember);

module.exports = router;
