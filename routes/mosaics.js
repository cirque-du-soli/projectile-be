const express = require("express");
const router = express.Router();
const {
  mosaicModel,
  columnModel,
  tileModel,
  toDoModel,
} = require("../models/mosaic");
const messageModel = require("../models/messages");
const userModel = require("../models/users");

router.post("/create", async (req, res) => {
  const { title, owner } = req.body;
  try {
    //ensure title is unique to this user
    const check = await mosaicModel.findOne({ title: title, owner: owner });
    if (check) {
      return res.status(400).json("Mosaic already exists");
    } else {
      //create mosaic
      const newMosaic = new mosaicModel({
        title: title,
        owner: owner,
        members: [],
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

// Route to delete a mosaic
router.delete("/:mosaicId", async (req, res) => {
  const mosaicId = req.params.mosaicId; // Retrieve mosaicId from URL params
  try {
    // Find the mosaic by ID and delete it
    const result = await mosaicModel.deleteOne({ _id: mosaicId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Mosaic not found" });
    }

    return res.status(200).json({ message: "Mosaic deleted successfully" });
  } catch (error) {
    console.error("Error deleting mosaic:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});





router.post("/addMember", async (req, res) => {
  const { selectedUsers, mosaicId } = req.body;
  try {
    // Find the mosaic by ID
    const mosaic = await mosaicModel.findById(mosaicId);
    if (!mosaic) {
      return res.status(404).json("Mosaic not found");
    }

    // If selectedUsers is empty, remove all members from the mosaic
    if (selectedUsers.length === 0) {
      mosaic.members = [];
    } else {
      // Iterate over the selectedUsers array and extract userIds
      const userIds = selectedUsers.map((user) => user._id);

      // Iterate over the selectedUsers array and add each user to the mosaic's members array
      userIds.forEach(async (userId) => {
        // Check if the user is already a member of the mosaic
        if (!mosaic.members.includes(userId)) {
          mosaic.members.push(userId);
        }
      });
    }

    await mosaic.save();

    return res.status(200).json("Users added to mosaic members successfully");
  } catch (error) {
    console.error("Error adding users to mosaic members:", error);
    return res.status(500).json("Internal server error");
  }
});

router.get("/:mosaicId/collaborators", async (req, res) => {
  const { mosaicId } = req.params;

  try {
    // Find the mosaic by ID
    const mosaic = await mosaicModel.findById(mosaicId);

    if (!mosaic) {
      return res.status(404).json("Mosaic not found");
    }

    // Fetch member data based on member IDs
    const collaborators = await Promise.all(
      mosaic.members.map(async (memberId) => {
        const member = await userModel.findById(memberId);
        return member ? { id: member._id, username: member.username } : null;
      })
    );

    res.status(200).json(collaborators.filter((member) => member)); // Filter out null values
  } catch (error) {
    console.error("Error fetching current collaborators:", error);
    res.status(500).json({ error: "Internal server error" });
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
        description: "Add description...",
        creationDate: Date.now(),
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, //plus 7 days (in milliseconds)
      });
      await addTile.save();
      //get new tile id
      const tileId = addTile._id;
      //add tileID to mosaic
      check.columns[columnIndex].tiles.push(tileId);
      await check.save();
      return res.status(200).json("Tile added");
    }
  } catch (error) {
    console.error("Error creating tile: ", error);
    return res.status(500).json("Internal server error");
  }
});

router.get("/byUsername", async (req, res) => {
  const username = req.query.username;

  try {
    // Fetch the current user's ID
    const currentUser = await userModel.findOne({ username });

    // Find mosaics where the owner is the specified username or the username appears in the members array
    const userMosaics = await mosaicModel.find({
      $or: [
        { owner: username }, // Find mosaics where the owner is the current user's ID
        { members: currentUser._id }, // Find mosaics where the current user's ID appears in the members array
      ],
    });

    if (!userMosaics || userMosaics.length === 0) {
      console.log("No mosaics found for the user.");
      return res.status(200).json("No mosaics found for the user.");
    } else {
      return res.status(200).json(userMosaics);
    }
  } catch (error) {
    console.error("Error fetching user mosaics:", error);
    return res.status(500).json({ error: "Internal server error" });
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
    console.log(error);
    return res.status(500).json(error);
  }
});

router.get("/tile", async (req, res) => {
  const id = req.query.id;
  console.log("get tile request, id: " + id);
  try {
    const selTile = await tileModel.findOne({ _id: id });
    if (!selTile) {
      console.log("nothing here bro");
      return res.status(400).json("tile not found");
    } else {
      console.log(selTile);
      return res.status(200).json(selTile);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.delete("/tile", async (req, res) => {
  const tileId = req.query.id;
  try {
    const tile = await tileModel.findOne({ _id: tileId });
    if (!tile) {
      return res.status(400).json("tile not found");
    } else {
      const updatedMosaic = await mosaicModel.findOneAndUpdate(
        { "columns.tiles": tileId },
        { $pull: { "columns.$.tiles": tileId } },
        { new: true } // Return the updated mosaic
      );

      if (!updatedMosaic) {
        return res.status(400).json("Mosaic not found");
      }
      await tileModel.deleteOne({ _id: tileId });

      return res.status(200).json("Tile deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting tile:", error);
    return res.status(500).json("Internal server error");
  }
});

router.get("/:boardId/messages", async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const messages = await messageModel.find({ boardId: boardId });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

router.put("/renameTile", async (req, res) => {
  const { id, name } = req.body;
  try {
    const tile = await tileModel.findOne({ _id: id });
    if (!tile) {
      return res.status(400).json("Tile not found");
    } else {
      tile.title = name;
      await tile.save();
      return res.status(200).json("Tile renamed successfully");
    }
  } catch (error) {
    console.error("Error renaming tile:", error);
    return res.status(500).json("Internal server error");
  }
});

router.delete("/toDo", async (req, res) => {
  const id = req.query.id;
  try {
    const tile = await tileModel.findOne({ "toDoList._id": id });
    if (!tile) {
      return res.status(400).json("tile not found");
    } else {
      const toDoIndex = tile.toDoList.findIndex(
        (toDo) => toDo._id.toString() === id.toString()
      );
      if (toDoIndex === -1) {
        return res.status(400).json("to do not found in the tile");
      }
      tile.toDoList.splice(toDoIndex, 1);
      await tile.save();
      return res.status(200).json(tile._id);
    }
  } catch (error) {
    console.error("Error deleting tile:", error);
    return res.status(500).json("Internal server error");
  }
});

router.put("/tileDate", async (req, res) => {
  const { date, id } = req.body;
  try {
    const tile = await tileModel.findOne({ _id: id });
    if (!tile) {
      return res.status(400).json("Tile not found");
    } else {
      tile.dueDate = date;
      await tile.save();
      return res.status(200).json(tile._id);
    }
  } catch (error) {
    console.error("Error updating due date:", error);
    return res.status(500).json("Internal server error");
  }
});

router.put("/tileDescription", async (req, res) => {
  const { id, description } = req.body;
  try {
    const tile = await tileModel.findOne({ _id: id });
    if (!tile) {
      return res.status(400).json("Tile not found");
    } else {
      tile.description = description;
      await tile.save();
      return res.status(200).json(tile._id);
    }
  } catch (error) {
    console.error("Error updating description:", error);
    return res.status(500).json("Internal server error");
  }
});

router.post("/newToDo", async (req, res) => {
  const { id, name } = req.body;
  try {
    const tile = await tileModel.findOne({ _id: id });
    if (!tile) {
      return res.status(400).json("tile not found");
    } else {
      const newToDo = new toDoModel({
        title: name,
        done: false,
      });
      tile.toDoList.push(newToDo);
      await tile.save();
      return res.status(200).json(tile._id);
    }
  } catch (error) {
    console.error("Error adding to do item: ", error);
    return res.status(500).json("Internal server error");
  }
});

router.put("/renameToDo", async (req, res) => {
  const { id, title } = req.body;
  try {
    const tile = await tileModel.findOne({ "toDoList._id": id });
    if (!tile) {
      return res.status(400).json("tile not found");
    } else {
      const toDoIndex = tile.toDoList.findIndex(
        (toDo) => toDo._id.toString() === id.toString()
      );
      if (toDoIndex === -1) {
        return res.status(400).json("to do not found in the tile");
      }
      tile.toDoList[toDoIndex].title = title;
      await tile.save();
      return res.status(200).json(tile._id);
    }
  } catch (error) {
    console.error("Error deleting tile:", error);
    return res.status(500).json("Internal server error");
  }
});

router.put("/toDoStatus", async (req, res) => {
  const { stat, id } = req.body;
  try {
    const tile = await tileModel.findOne({ "toDoList._id": id });
    if (!tile) {
      res.status(400).json("Tile not found");
    } else {
      const toDoIndex = tile.toDoList.findIndex(
        (toDo) => toDo._id.toString() === id.toString()
      );
      if (toDoIndex === -1) {
        return res.status(400).json("to do not found in the tile");
      }
      // Update the title of the column
      tile.toDoList[toDoIndex].done = stat;
      await tile.save();
      return res.status(200).json(tile._id);
    }
  } catch (error) {
    console.error("Error changing to do status: ", error);
    return res.status(500).json("Internal server error");
  }
});

router.put("/assignTile", async (req, res) => {
  const { member, id } = req.body;
  try {
    const tile = await tileModel.findOne({ _id: id });
    if (!tile) {
      res.status(400).json("Tile not found");
    } else {
      tile.assigned = member;
      await tile.save();
      return res.status(200).json(tile._id);
    }
  } catch (error) {
    console.error("Error assigning user to tile: ", error);
    return res.status(500).json("Internal server error");
  }
});

router.put("/updateTilesOrder", async (req, res) => {
  try {
    const { columnId, newTilesOrder, mosaicId } = req.body;

    const mosaic = await mosaicModel.findById(mosaicId);
    if (!mosaic) {
      return res.status(404).json({ error: "Mosaic not found" });
    }

    // Find the column within the mosaic
    const columnToUpdate = mosaic.columns.find(
      (col) => col._id.toString() === columnId
    );
    if (!columnToUpdate) {
      return res.status(404).json({ error: "Column not found within mosaic" });
    }

    // Update the tiles order in the column
    columnToUpdate.tiles = newTilesOrder.map((tile) => tile.split(":")[0]);
    await mosaic.save();
    res.status(200).json({ message: "Tile order updated successfully" });
  } catch (error) {
    console.error("Error updating tile order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
