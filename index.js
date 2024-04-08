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
connectDB();

// Routes
const authRouter = require("./routes/authorization");
const mosaicRouter = require("./routes/mosaics");
const userSettings = require("./routes/userSettings")

app.use("/auth", authRouter);
app.use("/mosaics", mosaicRouter);
app.use("/settings", userSettings);

// Root route
app.get("/", (req, res) => { });

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
