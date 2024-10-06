const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "orders.json");

app.use(bodyParser.json());
app.use(cors());

// Kiểm tra nếu file orders.json không tồn tại thì tạo mới
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ orders: [], statistics: {} }));
}

// Đọc dữ liệu từ file JSON
const readDataFromFile = () => {
  const rawData = fs.readFileSync(DATA_FILE);
  return JSON.parse(rawData);
};

// Ghi dữ liệu vào file JSON
const writeDataToFile = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// API để lấy lịch sử đặt hàng
app.get("/api/orders", (req, res) => {
  const data = readDataFromFile();
  res.json(data.orders);
});

// API để tạo đơn hàng mới
app.post("/api/orders", (req, res) => {
  const newOrder = req.body;
  const data = readDataFromFile();

  // Thêm đơn hàng vào danh sách
  data.orders.push(newOrder);

  // Cập nhật thống kê
  newOrder.items.forEach((item) => {
    if (!data.statistics[item.name]) {
      data.statistics[item.name] = { sold: 0 };
    }
    data.statistics[item.name].sold += 1;
  });

  // Ghi dữ liệu mới vào file
  writeDataToFile(data);

  res.status(201).json({ message: "Đơn hàng đã được lưu thành công!" });
});

// API để lấy thống kê doanh thu và số lượng món ăn
app.get("/api/statistics", (req, res) => {
  const data = readDataFromFile();
  const orders = data.orders;

  const day = req.query.day ? new Date(req.query.day) : null;
  const month = req.query.month ? new Date(req.query.month) : null;

  //   console.log("Day:", day); // Kiểm tra tham số ngày
  //   console.log("Month:", month); // Kiểm tra tham số tháng

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.date);

    if (day) {
      return orderDate.toDateString() === day.toDateString();
    }

    if (month) {
      return (
        orderDate.getFullYear() === month.getFullYear() &&
        orderDate.getMonth() === month.getMonth()
      );
    }

    return true; // Trả về tất cả nếu không có tham số lọc
  });

  //   console.log("Filtered Orders:", filteredOrders); // Kiểm tra đơn hàng sau khi lọc

  const foodSales = {};
  let cashRevenue = 0;
  let bankTransferRevenue = 0;

  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!foodSales[item.name]) {
        foodSales[item.name] = { sold: 0, revenue: 0 };
      }
      foodSales[item.name].sold += 1;
      foodSales[item.name].revenue += item.price;
    });

    if (order.paymentMethod === "cash") {
      cashRevenue += order.total;
    } else if (order.paymentMethod === "bank") {
      bankTransferRevenue += order.total;
    }
  });

  //   console.log("Cash Revenue:", cashRevenue); // Kiểm tra doanh thu tiền mặt
  //   console.log("Bank Transfer Revenue:", bankTransferRevenue); // Kiểm tra doanh thu chuyển khoản

  res.json({
    foodSales,
    cashRevenue,
    bankTransferRevenue,
    from: day
      ? day.toISOString().slice(0, 10)
      : month
      ? `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(
          2,
          "0"
        )}`
      : "N/A",
    to: day
      ? day.toISOString().slice(0, 10)
      : month
      ? `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(
          2,
          "0"
        )}`
      : "N/A",
  });
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
