const express = require("express");
const cors = require("cors");
const collection = require("./mongodb");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const port = process.env.PORT;

app.get("/", cors(), (req, res) => {});

app.post("/", async (req, res) => {
  console.log("login post request");
  const { username, password } = req.body;

  try {
    const check = await collection.findOne({ username: username });

    if (check) {
      return res.json("exist");
    } else {
      return res.json("notexist");
    }
  } catch (e) {
    return res.json("fail");
  }
});

app.post("/regi", async (req, res) => {
  console.log("registration post request");
  const { username, password } = req.body;

  const data = {
    username: username,
    password: password,
  };

  try {
    const check = await collection.findOne({ username: username });

    if (check) {
      return res.json("exist");
    } else {
      await collection.insertMany([data]);
      return res.json("notexist");
    }
  } catch (e) {
    return res.json("fail");
  }
});

app.listen(port, () => {
  console.log("running on port " + port);
});
