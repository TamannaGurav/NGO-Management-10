const NGO = require("../models/ngoModel");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

/**
 * Request NGO Registration (Admin submits a request)
 */
const requestNGORegistration = async (req, res) => {
    try {
        // Extract NGO and admin details from the request body
        const { name, address, contactEmail, adminName, adminEmail } = req.body;

        // Validate that all required fields are provided
        if (!name || !address || !contactEmail || !adminName || !adminEmail) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if an NGO with the same contact email already exists
        const existingNGO = await NGO.findOne({ contactEmail });
        if (existingNGO) {
            return res.status(400).json({ message: "NGO already exists with this email" });
        }

        // Create NGO registration request with "pending" status
        // and include the admin details in the NGO document
        const newNGO = await NGO.create({ 
            name, 
            address, 
            contactEmail, 
            adminName, 
            adminEmail, 
            status: "pending" 
        });

        res.status(201).json({ 
            message: "NGO registration request submitted. Awaiting approval.", 
            ngo: newNGO 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


/**
 * Approve NGO (Super Admin only)
 */
const approveNGO = async (req, res) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ message: "Access denied. Super Admin only." });
        }

        const ngo = await NGO.findById(req.params.id);
        if (!ngo) {
            return res.status(404).json({ message: "NGO not found" });
        }

        if (ngo.status === "approved") {
            return res.status(400).json({ message: "NGO is already approved" });
        }

         // Ensure NGO is pending approval
         if (ngo.status !== "pending") {
            return res.status(400).json({ message: "NGO is not pending approval" });
        }

        if (!ngo.adminName || !ngo.adminEmail) {
            return res.status(400).json({ message: "Admin details missing in NGO registration request" });
        }

        // Use a default password for the admin account
        const defaultPassword = "Admin@123"; // Admin must reset upon first login
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Create the admin user for this NGO
        const adminUser = new User({
            name: ngo.adminName,
            email: ngo.adminEmail,
            password: hashedPassword,
            role: "admin",
            ngoId: ngo._id,
            status: "approved",
        });
        await adminUser.save();

        // Update NGO status to approved
        ngo.status = "approved";
        await ngo.save();

        res.status(200).json({
            message: "NGO approved successfully. Admin account created.",
            ngo,
            admin: {
                email: adminUser.email,
                defaultPassword: defaultPassword, // Inform admin to reset this password on first login
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Reject NGO Request (Super Admin only)
 */
const rejectNGO = async (req, res) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ message: "Access denied. Super Admin only." });
        }

        const ngo = await NGO.findByIdAndDelete(req.params.id);
        if (!ngo) {
            return res.status(404).json({ message: "NGO not found" });
        }

        res.status(200).json({ message: "NGO registration request rejected and removed." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Get all NGOs (Super Admin only, includes pending NGOs)
 */
const getAllNGOs = async (req, res) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ message: "Access denied. Super Admin only." });
        }

        const ngos = await NGO.find();
        res.status(200).json(ngos);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Get NGO by ID
 */
const getNGOById = async (req, res) => {
    try {
      const ngo = await NGO.findById(req.params.id);
      if (!ngo) {
        return res.status(404).json({ message: "NGO not found" });
      }
  
      if (req.user.role !== "super_admin" && req.user.ngoId.toString() !== ngo._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
      console.log("NGO found: ", ngo);
  
  
        console.log("Access denied for user: ", req.user);
      res.status(200).json(ngo);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
    //   console.log("Error getting NGO by ID: ", error);

/**
 * Delete NGO (Super Admin only)
 */
const deleteNGO = async (req, res) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ message: "Access denied. Super Admin only." });
        }

        const ngo = await NGO.findByIdAndDelete(req.params.id);
        if (!ngo) {
            return res.status(404).json({ message: "NGO not found" });
        }

        res.status(200).json({ message: "NGO deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    requestNGORegistration,
    approveNGO,
    rejectNGO,
    getAllNGOs,
    getNGOById,
    deleteNGO
};
