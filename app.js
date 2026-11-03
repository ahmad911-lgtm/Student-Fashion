const express = require("express");
const cors = require("cors");

const Product = require("./models/product");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Home API
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Student Fashion API!"
  });
});

// Public: Get all products for the customer website
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin login and protected product management
app.use("/api/admin", adminRoutes);

module.exports = app;
