const fs = require("fs");
const express = require("express");
const router = express.Router();
const multer = require("multer"); // To handle multipart/form-data
const userModel = require("../models/users");
const { uploadFileToR2, deleteFileFromR2, getFileFromR2 } = require("../services/cloudflareR2");

// Multer setup to handle file uploads
const upload = multer({ dest: 'uploads/' });

// TODO: Add middleware to authenticate the user and append their info to req.user

router.patch("/ChangeProfilePicture", upload.single('profilePic'), async (req, res) => {
    try {
        /*
        if (!req.user) {
            return res.status(401).send({ message: "User not authenticated" });
        }
*/
        if (!req.file) {
            return res.status(400).send({ message: "No file uploaded" });
        }

        const originalFileName = req.file.originalname;
        const fileName = req.file.filename;
        const fileStream = fs.createReadStream(req.file.path);

        // Upload the file to Cloudflare R2 
        await uploadFileToR2(fileStream, fileName, originalFileName);

        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error("Failed to delete local file", err);
            } else {
                console.log("Successfully deleted local file");
            }
        });

        // req.user._id
        // Update the user model with the new profile picture
        const updatedUser = await userModel.findByIdAndUpdate("6613366b5878c63c07a4f1b7", {
            'profilePicFileName': req.file.filename,
        }, { new: true });

        res.status(200).send({ message: "Profile picture updated", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

module.exports = router;