const User = require("../models/userModel");

/**
 * Get all members (staff & volunteers) belonging to the admin's NGO.
 * Only the admin can fetch members of their own NGO.
 */
const getMembers = async (req, res) => {
  try {
    const ngoId = req.user.ngoId;
    if (!ngoId) {
      return res.status(400).json({ message: "Admin is not linked to any NGO" });
    }
    // Fetch users with roles 'staff' or 'volunteer' belonging to the same NGO.
    const members = await User.find({ 
      ngoId, 
      role: { $in: ["staff", "volunteer"] } 
    }).select("-password"); // Exclude passwords

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a member's details.
 * Only an admin can update a member if that member belongs to their NGO.
 */
const updateMember = async (req, res) => {
  try {
    const { id } = req.params; // Member's user ID
    const { name, email, role } = req.body;

    // Find the member user
    const member = await User.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    // Verify that the member belongs to the admin's NGO
    if (member.ngoId.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ message: "Access denied: Member does not belong to your NGO" });
    }
    // Only allow updating to roles that are allowed for members
    if (role && !["staff", "volunteer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role for a member. Allowed roles: staff, volunteer" });
    }

    if (name) member.name = name;
    if (email) member.email = email;
    if (role) member.role = role;

    await member.save();

    res.status(200).json({ message: "Member updated successfully", member });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a member.
 * Only an admin can delete a member if that member belongs to their NGO.
 */
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params; // Member's user ID

    // Find the member user
    const member = await User.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    // Check if the member belongs to the admin's NGO
    if (member.ngoId.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ message: "Access denied: Member does not belong to your NGO" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getMembers, updateMember, deleteMember };
