const mongoose = require("mongoose");

const tileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  creationDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
});

const columnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  tiles: [String], // Array of tiles associated with the column
});

const mosaicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  columns: [columnSchema], // Array of columns associated with the mosaic
  owner: {
    type: String,
    required: true,
  },
});

const mosaicModel = new mongoose.model("Mosaic", mosaicSchema);
const columnModel = new mongoose.model("Column", columnSchema);
const tileModel = new mongoose.model("Tile", tileSchema);

module.exports = {
  mosaicModel,
  columnModel,
  tileModel,
};
