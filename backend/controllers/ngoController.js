const NGO = require("../models/ngoModel");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../config/emailConfig");

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

  // **1️⃣ Send email to the NGO Admin confirming request submission**
// Send email confirmation to the NGO Admin
await sendEmail(
    adminEmail, // NGO Admin's Email
    "🎉 NGO Registration Submitted Successfully",
    `Your NGO (${name}) registration request has been received.`,
    `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #28a745;">✅ NGO Registration Submitted</h2>
      <p>Dear ${adminName},</p>
      <p>We have received your NGO registration request. Our team will review your submission, and you will be notified once it has been approved.</p>
  
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>NGO Name:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Address:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${address}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Contact Email:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${contactEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Submitted By:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${adminName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Admin Email:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${adminEmail}</td>
        </tr>
      </table>
  
      <p style="margin-top: 20px;">You can check the status of your request by contacting our support team.</p>
      <p>If approved, you will receive another email with further instructions.</p>
  
      <p style="margin-top: 20px; font-size: 12px; color: #888;">
        This is an automated message. Please do not reply.
      </p>
    </div>
    `
  );
  

// **2️⃣ Send email to the Super Admin for approval**
// Send email to Super Admin for approval with improved HTML
await sendEmail(
    "tamannaah1302@gmail.com", // Replace with actual Super Admin email
    "🚀 New NGO Registration Request",
    `A new NGO (${name}) has requested registration.`, // Plain text fallback
    `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #0066cc;">📢 New NGO Registration Request</h2>
      <p>A new NGO has requested registration on the platform.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>NGO Name:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Address:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${address}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Contact Email:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${contactEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Admin Name:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${adminName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Admin Email:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${adminEmail}</td>
        </tr>
      </table>
  
      <p style="margin-top: 20px;">Please review this request and take the necessary action.</p>
      <p><a href="http://your-ngo-platform.com/admin/approvals" style="color: #0066cc; font-weight: bold;">🔗 Review & Approve NGO</a></p>
  
      <p style="margin-top: 20px; font-size: 12px; color: #888;">
        This is an automated message. Please do not reply.
      </p>
    </div>
    `
  );
  

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

        // Send approval email to the NGO Admin (With Login Details)
await sendEmail(
    adminUser.email, // NGO Admin's Email
    "🎉 Your NGO Has Been Approved!",
    `Your NGO (${ngo.name}) has been approved. You can now log in using the credentials below.`,
    `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #28a745;">🎉 Congratulations! Your NGO is Approved</h2>
      <p>Dear ${ngo.adminName},</p>
      <p>We are pleased to inform you that your NGO registration request has been approved.</p>
  
      <h3 style="color: #007bff;">🔑 Your Admin Login Credentials:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${adminUser.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Temporary Password:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${defaultPassword}</td>
        </tr>
      </table>
  
      <p style="margin-top: 20px; color: #d9534f;"><strong>⚠️ Important:</strong> For security reasons, please log in and reset your password immediately.</p>
  
      <h3 style="color: #007bff;">🛠 Next Steps:</h3>
      <ol>
        <li>Visit the <a href="http://your-ngo-platform.com/login" style="color: #007bff;">Login Page</a>.</li>
        <li>Enter the email and temporary password provided above.</li>
        <li>Go to "Account Settings" and change your password.</li>
      </ol>
  
      <p style="margin-top: 20px;">We are excited to have you onboard and look forward to supporting your NGO’s mission.</p>
  
      <p style="margin-top: 20px; font-size: 12px; color: #888;">
        This is an automated message. Please do not reply.
      </p>
    </div>
    `
  );
  
  // Send a simple approval confirmation to the NGO Contact Email
  await sendEmail(
    ngo.contactEmail, // NGO Contact Email
    "✅ Your NGO Registration Has Been Approved!",
    `Your NGO (${ngo.name}) has been successfully approved. Your admin, ${ngo.adminName}, has been granted access to the platform.`,
    `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #28a745;">✅ Your NGO Registration is Approved</h2>
      <p>Dear Team,</p>
      <p>We are delighted to inform you that your NGO, <strong>${ngo.name}</strong>, has been successfully approved.</p>
  
      <h3 style="color: #007bff;">🔹 What’s Next?</h3>
      <ul>
        <li>Your assigned admin, <strong>${ngo.adminName}</strong>, has been given login access.</li>
        <li>They will manage your NGO’s profile and operations on the platform.</li>
        <li>If you have any questions, feel free to reach out to our support team.</li>
      </ul>
  
      <p style="margin-top: 20px;">We look forward to working with you and supporting your mission.</p>
  
      <p style="margin-top: 20px; font-size: 12px; color: #888;">
        This is an automated message. Please do not reply.
      </p>
    </div>
    `
  );
  

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

        const ngo = await NGO.findById(req.params.id);
        if (!ngo) {
            return res.status(404).json({ message: "NGO not found" });
        }

        if (!ngo.adminEmail || !ngo.contactEmail) {
            return res.status(400).json({ message: "Missing admin or contact email" });
        }

        // Reason for rejection (if provided)
        const rejectionReason = req.body.reason || "Not specified";

        // Send rejection email to NGO Admin
        await sendEmail(
            ngo.adminEmail,
            "❌ NGO Registration Rejected",
            `Your NGO (${ngo.name}) registration request has been rejected and removed from our system.`,
            `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #d9534f;">❌ NGO Registration Rejected</h2>
                <p>Dear ${ngo.adminName},</p>
                <p>We regret to inform you that your NGO registration request for <strong>${ngo.name}</strong> has been rejected and removed from our system.</p>
                
                <h3 style="color: #007bff;">📌 Reason for Rejection:</h3>
                <blockquote style="background-color: #f8d7da; padding: 10px; border-left: 5px solid #d9534f;">
                    ${rejectionReason}
                </blockquote>

                <h3 style="color: #007bff;">🔹 What You Can Do:</h3>
                <ul>
                    <li>Review the rejection reason and make necessary corrections.</li>
                    <li>Submit a new registration request with the required details.</li>
                    <li>If you believe this was an error, contact our support team.</li>
                </ul>

                <p style="margin-top: 20px;">We appreciate your interest and encourage you to reapply after addressing the concerns.</p>

                <p style="margin-top: 20px; font-size: 12px; color: #888;">
                    This is an automated message. Please do not reply.
                </p>
            </div>
            `
        );

        // Send rejection email to NGO Contact Email
        await sendEmail(
            ngo.contactEmail,
            "❌ NGO Registration Rejected",
            `Your NGO (${ngo.name}) registration request has been rejected and removed from our system.`,
            `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #d9534f;">❌ NGO Registration Rejected</h2>
                <p>Dear Team,</p>
                <p>We regret to inform you that the registration request for <strong>${ngo.name}</strong> has been rejected and removed from our system.</p>

                <h3 style="color: #007bff;">📌 Reason for Rejection:</h3>
                <blockquote style="background-color: #f8d7da; padding: 10px; border-left: 5px solid #d9534f;">
                    ${rejectionReason}
                </blockquote>

                <h3 style="color: #007bff;">🔹 What You Can Do:</h3>
                <ul>
                    <li>Ensure all required details are correct before reapplying.</li>
                    <li>Contact our support team if you need further clarification.</li>
                </ul>

                <p style="margin-top: 20px;">Thank you for your interest, and we encourage you to apply again in the future.</p>

                <p style="margin-top: 20px; font-size: 12px; color: #888;">
                    This is an automated message. Please do not reply.
                </p>
            </div>
            `
        );

        // Now delete the NGO from the database
        await NGO.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "NGO registration request rejected and removed. Emails sent." });

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
