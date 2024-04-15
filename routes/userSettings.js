const fs = require("fs");
const express = require("express");
const router = express.Router();
const multer = require("multer"); // To handle multipart/form-data
const userModel = require("../models/users");
const { uploadFileToR2, deleteFileFromR2, getFileFromR2 } = require("../services/cloudflareR2");
const { validateToken } = require("../services/authmiddleware");
const bcrypt = require("bcrypt")

// Multer setup to handle file uploads
const upload = multer({ dest: 'uploads/' });

router.patch("/profilepicture", validateToken, upload.single('profilePic'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: "No file uploaded" });
        }

        const fileType = req.file.mimetype;
        if (fileType !== 'image/jpeg' && fileType !== 'image/png') {
            fs.unlink(req.file.path, (err) => { // Delete the uploaded file as it's not a valid type
                if (err) console.error("Cleanup failed for invalid file type", err);
            });
            return res.status(400).send({ message: "Invalid file type. Only JPG and PNG are allowed." });
        }

        const validatedToken = req.userToken;
        const userId = validatedToken.id;

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

        // Update the user model with the new profile picture
        const updatedUser = await userModel.findByIdAndUpdate(userId, {
            'profilePicFileName': req.file.filename,
        }, { new: true });

        res.status(200).send({ message: "Profile picture updated", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

router.get("/profilepicture", validateToken, async (req, res) => {
    try {
        const validatedToken = req.userToken;
        const userId = validatedToken.id;

        const user = await userModel.findById(userId);
        const userProfilePictureFileName = user.profilePicFileName;
        const fileData = await getFileFromR2(userProfilePictureFileName);

        res.setHeader('Content-Type', fileData.ContentType);
        res.send(fileData.Body);
    } catch (error) {
        console.error(error);
        if (error.code === 'NoSuchKey') {
            res.status(404).send({ message: "Profile picture not found" });
        } else {
            res.status(500).send({ message: "Internal server error" });
        }
    }
});

router.patch("/password", validateToken, async (req, res) => {
    try {
        const validatedToken = req.userToken;
        const userId = validatedToken.id;
        const submittedOldPassword = req.body.oldPassword;
        const submittedNewPassword = req.body.newPassword;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const match = await bcrypt.compare(submittedOldPassword, user.password);
        if (!match) {
            console.log("userSettings; Submitted password didn't match stored password");
            return res.status(400).json({ message: "Invalid old password" });
        }

        const hashedPass = await bcrypt.hash(submittedNewPassword, 10);
        await userModel.findByIdAndUpdate(userId, { password: hashedPass }, { new: true });
        console.log("Password succesfully changed");

        res.status(200).send({ message: "Successfully changed password" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/", validateToken, async (req, res) => {
    try {
        const validatedToken = req.userToken;
        const userId = validatedToken.id;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        res.status(200).send({ email: user.email, username: user.username });
    } catch (error) {
        console.error("Error retrieving user info:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

module.exports = router;
