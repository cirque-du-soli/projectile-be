const express = require("express");
const router = express.Router();
const { mosaicModel, columnModel, tileModel } = require("../models/mosaic");

router.post("/create", async (req, res) => {
  console.log("create mosaic request");
  const { title, owner } = req.body;
  try {
    const check = await mosaicModel.findOne({ title: title });
    if (check) {
      return res.status(400).json("Mosaic already exists");
    } else {
      const newMosaic = new mosaicModel({
        title: title,
        owner: owner,
      });

      // create basic template columns
      const column1 = new columnModel({
        title: "To Do",
      });
      const column2 = new columnModel({
        title: "In Progress",
      });
      const column3 = new columnModel({
        title: "Done",
      });

      // add to mosaic
      newMosaic.columns.push(column1);
      newMosaic.columns.push(column2);
      newMosaic.columns.push(column3);

      // save database
      await newMosaic.save();

      return res.status(200).json("Mosaic created successfully");
    }
  } catch (e) {
    console.error("Error creating mosaic:", e);
    return res.status(500).json("Internal server error");
  }
});

router.get("/byUsername", async (req, res) => {
  const username = req.query.username;
  try {
    const userMosaics = await mosaicModel.find({ owner: username });
    if (!userMosaics || userMosaics.length === 0) {
      console.log("empty");
      return res.status(200).json("empty");
    } else {
      return res.status(200).json(userMosaics);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/byID", async (req, res) => {
  const id = req.query.id;
  try {
    const selMosaic = await mosaicModel.findOne({ _id: id });
    if (!selMosaic) {
      console.log("nothing here bro");
      return res.status(400).json("nothing here");
    } else {
      console.log(selMosaic);
      return res.status(200).json(selMosaic);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
