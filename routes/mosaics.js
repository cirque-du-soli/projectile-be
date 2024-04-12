const express = require("express");
const router = express.Router();
const { mosaicModel, columnModel, tileModel } = require("../models/mosaic");

router.post("/create", async (req, res) => {
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

router.post("/column", async (req, res) => {
  const { title, _id } = req.body;
  try {
    const check = await mosaicModel.findOne({ _id: _id });
    if (!check) {
      console.log("_id not found");
      return res.status(400).json("Mosaic not found");
    } else {
      const newColumn = new columnModel({
        title: title,
      });
      check.columns.push(newColumn);
      // save database
      await check.save();

      return res.status(200).json("Column created successfully");
    }
  } catch (e) {
    console.error("Error creating Column:", e);
    return res.status(500).json("Internal server error");
  }
});

router.delete("/deleteColumn", async (req, res) => {
  const columnId = req.query.id;
  try {
    // Find the mosaic containing the column
    const mosaic = await mosaicModel.findOne({ "columns._id": columnId });
    if (!mosaic) {
      return res.status(400).json("Mosaic containing the column not found");
    } else {
      mosaic.columns.pull({ _id: columnId });
      await mosaic.save();
      return res.status(200).json("Column deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting column:", error);
    return res.status(500).json("Internal server error");
  }
});

router.put("/renameColumn", async (req, res) => {
  const { id, newTitle } = req.body;
  try {
    const mosaic = await mosaicModel.findOne({ "columns._id": id });
    if (!mosaic) {
      return res.status(400).json("Mosaic containing the column not found");
    } else {
      //find index of column to change
      const columnIndex = mosaic.columns.findIndex(
        (column) => column._id.toString() === id.toString()
      );
      if (columnIndex === -1) {
        return res.status(400).json("Column not found in the mosaic");
      }
      // Update the title of the column
      mosaic.columns[columnIndex].title = newTitle;
      await mosaic.save();
      return res.status(200).json("Column renamed successfully");
    }
  } catch (error) {
    console.error("Error renaming column:", error);
    return res.status(500).json("Internal server error");
  }
});

router.post("/tile", async (req, res) => {
  console.log("request received");
  const { colId, newTile, _id } = req.body;
  try {
    const check = await mosaicModel.findOne({ _id: _id });
    if (!check) {
      console.log("mosaic not found"); //clean
      return res.status(400).json("Mosaic not found");
    } else {
      console.log("found mosaic");
      //find index of column
      const columnIndex = check.columns.findIndex(
        (column) => column._id.toString() === colId.toString()
      );
      console.log("column index: " + columnIndex);
      if (columnIndex === -1) {
        return res.status(400).json("Column not found in the mosaic");
      }
      //create new tile
      const addTile = new tileModel({
        title: newTile,
      });
      await addTile.save();
      //get new tile id
      const tileId = addTile._id;
      //add tileID to mosaic
      check.columns[columnIndex].tiles.push(tileId);
      await check.save();
    }
  } catch (error) {
    console.error("Error creating tile: ", error);
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
      // okay so this weird lil block adds the tile title to the tile ID
      // for easy display of the title
      const numOfColumns = selMosaic.columns.length;
      for (i = 0; i < numOfColumns; i++) {
        const numOfTiles = selMosaic.columns[i].tiles.length;
        for (j = 0; j < numOfTiles; j++) {
          const tileId = selMosaic.columns[i].tiles[j];
          const tile = await tileModel.findOne({ _id: tileId });
          selMosaic.columns[i].tiles[j] += ":" + tile.title;
        }
      }
      return res.status(200).json(selMosaic);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/tile", async (req, res) => {
  const id = req.body;
  try {
    const selTile = await tileModel.findOne({ _id: id });
    if (!selTile) {
      console.log("nothing here bro");
      return res.status(400).json("tile not found");
    } else {
      return res.status(200).json(selTile);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
