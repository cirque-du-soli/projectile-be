const express = require("express");
const cors = require("cors");
const collection = require("./mongodb");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const port = process.env.PORT;

const authRouter = require("./routes/authorization");
app.use("/auth", authRouter);

app.get("/", cors(), (req, res) => {});

app.listen(port, () => {
  console.log("running on port " + port);
});
