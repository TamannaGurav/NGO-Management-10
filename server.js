const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/dbConfig"); // Your MongoDB connection file
const authRoutes = require("./backend/routes/authRoutes");
const ngoRoutes = require("./backend/routes/ngoRoutes");
const invitationRoutes = require("./backend/routes/invitationRoutes");
const memberRoutes = require("./backend/routes/memberRoutes");
const taskRoutes = require("./backend/routes/taskRoutes");
const donationRoutes = require("./backend/routes/donationRoutes");
const eventRoutes = require("./backend/routes/eventRoutes");
const cors = require("cors");


dotenv.config();
connectDB(); // Connect to MongoDB



const app = express();

app.use(cors({
    origin: "http://localhost:3000", 
    methods: "GET,POST,PUT,DELETE",
    credentials: true
  }));

// Middleware
app.use(express.json());




// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ngos", ngoRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/events", eventRoutes);
app.use((req, res, next) => {
    console.log("Requested URL:", req.url);
    next();
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
