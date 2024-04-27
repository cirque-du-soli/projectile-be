const express = require("express");
const router = express.Router();
const userModel = require("../models/users");
const mosaicModel = require("../models/mosaic");
const messageModel = require("../models/messages");
const { ObjectId } = require('mongodb');
const { Keyspaces } = require("aws-sdk");
const bcrypt = require("bcrypt");


//////////////////////// ADMIN ROUTES ////////////////////////

///////// USER MANAGEMENT /////////

// GET ALL
router.get("/getAllUsers", async (req, res) => {
    const query = req.query.q;
    try {
        const users = await userModel.find({});
        //console.log("Get all users = success: ", users);

        // get createdAt date from ObjectId
let userTimestamps = users.map((pr, index) => (pr._id.getTimestamp()));
    
        res.status(200).json({users, userTimestamps});
    } catch (error) {
        console.error("Error searching users: ", error);
        res.status(500).json({ error: "E0034: 500 error searching users." });
    }

    console.log("End: /getAllUsers");
}); 

// CREATE ONE
router.post("/createNewUser", async (req, res) => {
    const { username, email, password, isAdmin } = req.body;
    try {
        const check1 = await userModel.findOne({ username: username });
        const check2 = await userModel.findOne({ email: email });
        if (check1) {
            return res.status(411).json("Bad Request: Username Already Exists");
        } else if (check2) {
            return res.status(412).json("Bad Request: Email Already Exists");
        } else {
            const hashedPass = await bcrypt.hash(password, 10);
            const newUser = new userModel({
                username: username,
                email: email,
                password: hashedPass,
                role: 0,
                profilePicFileName: "default-image.png",
                isAdmin: isAdmin,
                isSoftDeleted: false,
                isBanned: false,
            });

            await newUser.save();

            console.log("User added successfully:", newUser);

            res.status(211).json("success");
        }
    } catch (e) {

        console.error("Error adding user:", e);
        
        res.status(500).json({ error: "E0033: 500 error adding user." });
    }

    console.log("End: /createNewUser");
});


// (SOFT) DELETE/UNDELETE
router.patch("/toggleUserIsSoftDeleted", async (req, res) => {
    try {

        console.log("----------------- req.body: ", req.body);
        const user = await userModel.findById(req.body.user._id);
        if (!user) {
            return res.status(414).json({ message: "User not found!" });
        }

        await userModel.findByIdAndUpdate(user._id, { isSoftDeleted: !user.isSoftDeleted }, { new: true });

        console.log("User isSoftDeleted Toggled. isSoftDeleted = ", user.isSoftDeleted);

        res.status(200).send({ message: "Success: user isSoftDeleted toggled." });

    } catch (error) {
        console.error("Error toggling user isSoftDeleted:", error);
        res.status(500).json({ message: "E0068: Internal server error" });
    }
});

// BAN/UNBAN
router.patch("/toggleUserIsBanned", async (req, res) => {
    try {

        console.log("----------------- req.body: ", req.body);
        const user = await userModel.findById(req.body.user._id);
        if (!user) {
            return res.status(414).json({ message: "User not found!" });
        }
        await userModel.findByIdAndUpdate(user._id, { isBanned: !user.isBanned }, { new: true });

        console.log("User Ban Toggled. isBanned = ", user.isBanned);

        res.status(200).send({ message: "Success: user ban toggled." });

    } catch (error) {

        console.error("Error toggling user ban:", error);
        res.status(500).json({ message: "E0067: Internal server error" });

    }
});


// MAKE ADMIN / MAKE NON-ADMIN
router.patch("/toggleUserIsAdmin", async (req, res) => {
    try {
        console.log("----------------- req.body: ", req.body);
        const user = await userModel.findById(req.body.user._id);
        if (!user) {
            return res.status(414).json({ message: "User not found!" });
        }

        await userModel.findByIdAndUpdate(user._id, { isAdmin: !user.isAdmin }, { new: true });

        console.log("User isAdmin Toggled. isAdmin = ", user.isAdmin);

        res.status(200).send({ message: "Success: user isAdmin toggled." });

    } catch (error) {
        console.error("Error toggling user isAdmin:", error);
        res.status(500).json({ message: "E0068: Internal server error" });
    }
});





module.exports = router;
