const mongoose = require("mongoose");

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
  profilePicFileName: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  isSoftDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  isBanned: {
    type: Boolean,
    required: true,
    default: false,
  },
},
  {
  timestamps: true,

});

const userModel = new mongoose.model("Users", users);

module.exports = userModel;
