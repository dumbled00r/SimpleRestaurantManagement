const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
const mongoUri = process.env.MONGO_URL;
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mongoose schema for Orders
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

// Utility function to get start and end dates for day, week, or month
const getStartEndDate = (filterType, date) => {
  const currentDate = new Date(date);
  let startDate, endDate;

  if (filterType === "day") {
    startDate = new Date(currentDate.setHours(0, 0, 0, 0));
    endDate = new Date(currentDate.setHours(23, 59, 59, 999));
  } else if (filterType === "week") {
    const dayOfWeek = currentDate.getDay(); // Get day of the week (0: Sunday, 6: Saturday)
    const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Start of the week (Monday)
    startDate = new Date(currentDate.setDate(diff));
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // End of the week (Sunday)
  } else if (filterType === "month") {
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
  }

  return { startDate, endDate };
};

// API to get statistics by day, week, or month
app.get("/api/statistics", async (req, res) => {
  const { day, week, month } = req.query;
  let filterType, selectedDate;

  if (day) {
    filterType = "day";
    selectedDate = day;
  } else if (week) {
    filterType = "week";
    selectedDate = week;
  } else if (month) {
    filterType = "month";
    selectedDate = month;
  }

  const { startDate, endDate } = getStartEndDate(filterType, selectedDate);

  try {
    const orders = await Order.find({
      date: { $gte: startDate, $lte: endDate },
    });

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
      startDate,
      endDate,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// API to create a new order (for testing)
app.post("/api/orders", async (req, res) => {
  const { items, total, paymentMethod, date } = req.body;

  try {
    const newOrder = new Order({
      items,
      total,
      paymentMethod,
      date,
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
