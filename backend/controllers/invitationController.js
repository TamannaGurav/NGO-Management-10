const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
console.log("JWT_INVITATION_SECRET:", process.env.JWT_INVITATION_SECRET);


const generateInvitationLink = async (req, res) => {
  try {
    // Expect invitee's email and desired role (staff or volunteer) in the request body
    const { email, role } = req.body;
    // Get the admin's NGO ID from the authenticated admin (via protect middleware)
    const ngoId = req.user.ngoId;
    if (!ngoId) {
      return res.status(400).json({ message: "Admin is not linked to any NGO" });
    }
    
    // Build payload containing invitee's email, role, and NGO ID
    const payload = { email, role, ngoId };
    // Create a token using a dedicated invitation secret (set JWT_INVITATION_SECRET in your .env file)
    // Set token expiration to 24 hours (or as desired)
    const invitationToken = jwt.sign(payload, process.env.JWT_INVITATION_SECRET, { expiresIn: "24h" });
    
    // Construct the invitation link using a FRONTEND_URL from your .env, e.g., a registration page that accepts the token
    const invitationLink = `${process.env.FRONTEND_URL}/invite?token=${invitationToken}`;
    
    // For now, return the link in the response (later you can integrate email sending)
    res.status(200).json({ message: "Invitation link generated", invitationLink });
  } catch (error) {
    console.error("Error generating invitation link:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const acceptInvitation = async (req, res) => {
    console.log("Received invitation token:", req.body.token);

  try {
    // Expect token, name, and chosen password from the request body
    const { token, name, password } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Invitation token is required" });
    }
    
    // Verify the token using the same invitation secret
    const payload = jwt.verify(token, process.env.JWT_INVITATION_SECRET);
    // payload includes: { email, role, ngoId }
    
    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    
    // Hash the chosen password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create a new user using details from the token and invitee's submission
    const newUser = new User({
      name,                // Provided by the invitee
      email: payload.email, // From the token
      password: hashedPassword,
      role: payload.role,   // e.g., 'staff' or 'volunteer'
      ngoId: payload.ngoId, // Linked to the admin's NGO
      status: "approved"    // Automatically approved through invitation
    });
    
    await newUser.save();
    
    res.status(201).json({ message: "Invitation accepted, user registered successfully", user: newUser });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { generateInvitationLink,acceptInvitation };
