const express = require("express");
const router = express.Router();
const { generateInvitationLink, acceptInvitation } = require("../controllers/invitationController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authorize");

// Only an admin can generate invitation links
router.post("/generate", protect, authorize("admin"), generateInvitationLink);
router.post("/accept", acceptInvitation);


// Invitation acceptance endpoint (open to invitees, no auth needed since token proves their invitation)\nrouter.post("/accept", acceptInvitation);

module.exports = router;
