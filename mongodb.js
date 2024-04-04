const mongoose = require("mongoose");
require("dotenv").config();
const connectionString = process.env.DBCONNECT;

const connectDB = async () => {
  try {
    await mongoose.connect(connectionString);
    console.log("mongoDB connected");
  } catch (error) {
    console.error("Database failed to connect:", error);
  }
};

module.exports = connectDB;
