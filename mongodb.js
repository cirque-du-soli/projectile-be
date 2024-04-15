const mongoose = require("mongoose");
require("dotenv").config();
const connectionString = process.env.DBCONNECT;

const connectDB = async () => {
  try {
    await mongoose.connect(connectionString);
    console.log("S0005 Connected to MongoDB");
  } catch (error) {
    console.error("E0005 Database failed to connect:", error);
  }
};

module.exports = connectDB;
