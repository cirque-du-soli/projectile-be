const express = require("express");
const router = express.Router();
const userModel = require("../models/users");

// Route for searching users
router.get("/search", async (req, res) => {
  const query = req.query.q;

  try {
    // Search for users in the database based on the query
    const users = await userModel.find({
      $or: [
        { username: { $regex: query, $options: "i" } }, // Search by username (case-insensitive)
        { email: { $regex: query, $options: "i" } }, // Search by email (case-insensitive)
      ],
    });

    console.log("Users found:", users); // Log the users found in the database


    // Return the list of users found
    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
