const express = require("express");
const { 
    requestNGORegistration,
    approveNGO,
    rejectNGO,
    getAllNGOs,
    getNGOById,
    deleteNGO,
    getPendingNGOs
} = require("../controllers/ngoController");
const { authorize } = require("../middlewares/authorize");
const { protect } = require("../middlewares/authMiddleware");


const router = express.Router();

// Route to create an NGO
// Route for requesting NGO registration (public, requires login)
router.post("/request", requestNGORegistration);

// Route for Super Admin to approve an NGO
router.put("/:id/approve", protect, authorize("super_admin"), approveNGO);

// Route for Super Admin to reject and (not)delete an NGO request
router.put("/:id/reject", protect, authorize("super_admin"), rejectNGO);

// Route for Super Admin to get all NGOs (both pending and approved)
router.get("/", protect, authorize("super_admin"), getAllNGOs);

router.get("/pending", protect, authorize("super_admin"), getPendingNGOs);

// Route to get a single NGO by ID (accessible to logged-in users)
router.get("/:id", protect, getNGOById);

// Get pending NGOs (Only accessible to Super Admin)

// Route for Super Admin to delete an NGO
router.delete("/:id", protect, authorize("super_admin"), deleteNGO);

module.exports = router;
