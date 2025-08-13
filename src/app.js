const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const locationRoutes = require("./routes/locationRoutes");

dotenv.config();
connectDB();


const app = express();
app.use(cors({
  origin: "*", // Change to your React app's URL for better security
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use("/location", locationRoutes);
app.use("/trips", require("./routes/locationRoutes"));

module.exports = app;


