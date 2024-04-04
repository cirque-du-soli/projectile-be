const mongoose = require("mongoose");

const tileSchema = new mongoose.Schema({
  refNumber: {
    type: Number,
    required: true,
  },
  // Other properties of a tile
});

const columnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  tiles: [tileSchema], // Array of tiles associated with the column
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
