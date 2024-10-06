import React, { useState } from "react";
import OrderPage from "./components/OrderPage";
import OrderHistoryPage from "./components/OrderHistoryPage";
import StatisticsPage from "./components/StatisticsPage";

function App() {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [page, setPage] = useState("order");

  const handleAddToCart = (updatedCart) => {
    setCart(updatedCart);
  };

  // const handleCompleteOrder = (newOrder) => {
  //   // Gửi đơn hàng mới lên server
  //   fetch("http://localhost:5000/api/orders", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(newOrder),
  //   })
  //     .then((response) => response.json())
  //     .then(() => {
  //       alert("Đơn hàng đã được đặt thành công!");
  //       setCart([]); // Xóa giỏ hàng sau khi đặt hàng
  //       fetchOrders(); // Tải lại lịch sử đơn hàng
  //     })
  //     .catch((error) => {
  //       console.error("Lỗi khi gửi đơn hàng:", error);
  //     });
  // };

  const fetchOrders = () => {
    fetch("https://simplerestaurantmanagement.onrender.com/api/orders")
      .then((response) => response.json())
      .then((data) => {
        setOrders(data);
      });
  };

  const fetchStatistics = () => {
    fetch("https://simplerestaurantmanagement.onrender.com/api/statistics")
      .then((response) => response.json())
      .then((data) => {
        setStatistics(data);
      });
  };

  const handleNavigate = (newPage) => {
    setPage(newPage);
    if (newPage === "history") {
      fetchOrders();
    }
    if (newPage === "statistics") {
      fetchStatistics();
    }
  };

  return (
    <div className="App">
      <nav className="p-4 flex justify-around bg-gray-200">
        <button onClick={() => handleNavigate("order")}>Order Mới</button>
        <button onClick={() => handleNavigate("history")}>Lịch sử</button>
        <button onClick={() => handleNavigate("statistics")}>Doanh thu</button>
      </nav>

      {page === "order" && (
        <div>
          <OrderPage onAddToCart={handleAddToCart} />
          {/* <CheckoutPage cart={cart} onCompleteOrder={handleCompleteOrder} /> */}
        </div>
      )}
      {page === "history" && <OrderHistoryPage orders={orders} />}
      {page === "statistics" && <StatisticsPage statistics={statistics} />}
    </div>
  );
}

export default App;
