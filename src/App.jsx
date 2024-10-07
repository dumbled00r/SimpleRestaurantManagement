import React, { useState, useEffect } from "react";
import OrderPage from "./components/OrderPage";
import OrderHistoryPage from "./components/OrderHistoryPage";
import StatisticsPage from "./components/StatisticsPage";
import LoginPage from "./components/LoginPage"; // Import Login Page

function App() {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [page, setPage] = useState("order");
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(""); // Store the user's role

  const baseURL = "https://coutnhatrang-api.vercel.app";

  useEffect(() => {
    // Check if the user is already logged in
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const userRole = localStorage.getItem("role");
    setLoggedIn(isLoggedIn);
    setRole(userRole);
  }, []);

  const handleAddToCart = (updatedCart) => {
    setCart(updatedCart);
  };

  const fetchOrders = () => {
    fetch(`${baseURL}/api/orders`)
      .then((response) => response.json())
      .then((data) => {
        setOrders(data);
      });
  };

  const fetchStatistics = () => {
    fetch(`${baseURL}/api/statistics`)
      .then((response) => response.json())
      .then((data) => {
        setStatistics(data);
      });
  };

  const handleNavigate = (newPage) => {
    if (newPage === "statistics" && role !== "owner") {
      alert("Bạn không có quyền truy cập vào trang doanh thu.");
      return; // Block access if the user is not an owner
    }

    setPage(newPage);

    if (newPage === "history") {
      fetchOrders();
    }
    if (newPage === "statistics") {
      fetchStatistics();
    }
  };

  // Hàm xử lý đăng nhập thành công
  const handleLogin = (userRole) => {
    setLoggedIn(true);
    setRole(userRole);
  };

  // If user is not logged in, display the LoginPage
  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

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
        </div>
      )}
      {page === "history" && <OrderHistoryPage orders={orders} />}
      {page === "statistics" && role === "owner" && (
        <StatisticsPage statistics={statistics} />
      )}
      {page === "statistics" && role !== "owner" && (
        <div className="p-4">
          <h1 className="text-xl font-bold text-red-500">
            Bạn không có quyền truy cập vào trang này.
          </h1>
        </div>
      )}
    </div>
  );
}

export default App;
