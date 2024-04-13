const express = require("express");
const cors = require("cors");
const connectDB = require("./mongodb");
require("dotenv").config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB
connectDB().then(() => {
  console.log("S0003 Connected to MongoDB");

  // Routes
  const authRouter = require("./routes/authorization");
  const mosaicRouter = require("./routes/mosaics");
  const userSettings = require("./routes/userSettings")

  app.use("/auth", authRouter);
  app.use("/mosaics", mosaicRouter);
  app.use("/settings", userSettings);

  // *LAST* Server Basic GET Route: not-accessible when a static page is being served above.
  app.get("/", (req, res) => { 
    res.json({
      message:
        "Welcome to ProjecTile's Backend API Server. Good news: all is functional. ...Are you sure this is the app you're looking for?"
    }); //END: response
  }); //END: initial basic GET

  // Set and Listen on Port
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

}).catch((error) => {
  console.error("E0003 Database failed to connect: ", error);
  process.exit(1);
});

