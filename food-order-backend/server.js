const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
// dot env
require("dotenv").config();

// Initialize Express app
const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
const mongoUri = process.env.MONGO_URL; // Update this to your MongoDB URI\
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mongoose schema and model for Orders
const orderSchema = new mongoose.Schema({
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  total: Number,
  paymentMethod: String,
  date: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// API: Get order history from MongoDB
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 }); // Fetch orders in descending order of date
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// API: Create a new order
app.post("/api/orders", async (req, res) => {
  const newOrder = new Order(req.body); // Create new order document based on the request body

  try {
    await newOrder.save(); // Save the order in MongoDB
    res.status(201).json({ message: "Order successfully placed!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to place order" });
  }
});

// API: Get statistics (Revenue & Food Sales)
app.get("/api/statistics", async (req, res) => {
  try {
    const orders = await Order.find();
    const now = new Date();
    const foodSales = {};
    let cashRevenue = 0;
    let bankTransferRevenue = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!foodSales[item.name]) {
          foodSales[item.name] = { sold: 0, revenue: 0 };
        }
        foodSales[item.name].sold += item.quantity;
        foodSales[item.name].revenue += item.price * item.quantity;
      });

      // Calculate revenue based on payment method
      if (order.paymentMethod === "cash") {
        cashRevenue += order.total;
      } else if (order.paymentMethod === "bank") {
        bankTransferRevenue += order.total;
      }
    });

    res.json({
      foodSales,
      cashRevenue,
      bankTransferRevenue,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
