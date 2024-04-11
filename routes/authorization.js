const express = require("express");
const router = express.Router();
const userModel = require("../models/users");
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { validateToken } = require("../services/authmiddleware");

//login request
router.post("/", async (req, res) => {
  console.log("login post request");
  const { username, password } = req.body;

  try {
    const check = await userModel.findOne({ username: username });

    if (check) {
      bcrypt.compare(password, check.password).then((match) => {
        if (!match) {
          console.log("fail");
          return res.status(400).json("invalid password"); //error/bad/400
        } else {
          console.log("success");
          const accessToken = sign(
            { username: check.username, id: check._id },
            process.env.TOKENKEY
          );
          res.status(200).json(accessToken); //200 login successful
        }
      });
    } else {
      return res.status(400).json("notexist"); //400 user not found
    }
  } catch (e) {
    return res.status(500).json("fail"); //500
  }
});

//registration request
router.post("/regi", async (req, res) => {
  console.log("registration post request");
  const { username, email, password } = req.body;
  try {
    const check = await userModel.findOne({ username: username });
    if (check) {
      return res.json("exist"); //return error/bad/400
    } else {
      const hashedPass = await bcrypt.hash(password, 10);
      const newUser = new userModel({
        username: username,
        email: email,
        password: hashedPass,
        role: 0,
        profilePicFileName: "default-image.png",
      });
      await newUser.save();
      return res.json("success"); //200 registration successful
    }
  } catch (e) {
    return res.json("fail"); //return 500?
  }
});

//this is the auth-validator that is called when you first open the site
router.get("/", validateToken, async (req, res) => {
  const userid = req.userToken.id;
  try {
    const user = await userModel.findOne({ _id: userid });
    if (!user) {
      res.json({ error: "user doesn't exist" });
    } else {
      res.status(200).json(user.username);
    }
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
});

module.exports = router;
