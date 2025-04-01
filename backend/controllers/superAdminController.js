const User = require("../models/userModel");

const approveAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const superAdminId = req.user.id; // Ensure only super admin can approve

        // Check if requesting user is a super admin
        const superAdmin = await User.findById(superAdminId);
        if (!superAdmin || superAdmin.role !== "super_admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Find user and update status
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.status = "approved";
        await user.save();

        return res.status(200).json({ message: "Admin approved successfully", user });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { approveAdmin };
