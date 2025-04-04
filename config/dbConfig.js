require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,  // To avoid deprecated warnings
      useUnifiedTopology: true,  // To avoid deprecated warnings
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);  // Log success message
  } catch (error) {
    // Log the error and stop the app if connection fails
    console.error(`Error: ${error.message}`);
    process.exit(1); // Stop the app if DB connection fails
  }
};

module.exports = connectDB;
