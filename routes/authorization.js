const express = require("express");
const router = express.Router();
const collection = require("../mongodb");
const bcrypt = require("bcrypt");

//login request
router.post("/", async (req, res) => {
  console.log("login post request");
  const { username, password } = req.body;

  try {
    const check = await collection.findOne({ username: username });

    if (check) {
      bcrypt.compare(password, check.password).then((match) => {
        if (!match) {
          return res.json("invalid password"); //error/bad/400
        } else {
          return res.json("success"); //200 login successful
        }
      });
    } else {
      return res.json("notexist"); //400 user not found
    }
  } catch (e) {
    return res.json("fail"); //500
  }
});

//registration request
router.post("/regi", async (req, res) => {
  console.log("registration post request");
  const { username, email, password } = req.body;
  try {
    const check = await collection.findOne({ username: username });
    if (check) {
      return res.json("exist"); //return error/bad/400
    } else {
      const hashedPass = await bcrypt.hash(password, 10);
      const data = {
        username: username,
        email: email,
        password: hashedPass,
        role: 0,
      };
      await collection.insertMany([data]);
      return res.json("success"); //200 registration successful
    }
  } catch (e) {
    return res.json("fail"); //return 500?
  }
});

module.exports = router;
