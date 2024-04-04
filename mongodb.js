const mongoose = require("mongoose");
require("dotenv").config();
const connectionString = process.env.DBCONNECT;

mongoose
  .connect(connectionString)
  .then(() => {
    console.log("mongoDB connected");
  })
  .catch(() => {
    console.log("Database failed to connect");
  });

const users = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    required: true,
  },
});

const userModel = new mongoose.model("Collection1", users);

module.exports = userModel;
