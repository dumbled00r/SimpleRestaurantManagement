import React, { useEffect, useState } from "react";

// Hàm để tạo danh sách các ngày với định dạng dd/MM/yyyy
const generateDaysList = () => {
  const days = [];
  const currentDate = new Date();
  for (let i = 0; i < 30; i++) {
    const day = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
    const formattedDay = `${String(day.getDate()).padStart(2, "0")}/${String(
      day.getMonth() + 1
    ).padStart(2, "0")}/${day.getFullYear()}`;
    days.push({
      value: day.toISOString().slice(0, 10), // Use ISO for backend
      label: formattedDay, // Display format: dd/MM/yyyy
    });
  }
  return days;
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [showScrollButton, setShowScrollButton] = useState(false);

  const baseUrl = "https://simplerestaurantmanagement.onrender.com";

  useEffect(() => {
    fetchOrders(selectedDate);
  }, [selectedDate]);

  const fetchOrders = (date) => {
    setLoading(true);
    fetch(`${baseUrl}/api/orders?day=${date}`)
      .then((response) => response.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching order history:", error);
        setLoading(false);
      });
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleDeleteSelected = () => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa các đơn hàng đã chọn?"
    );
    if (!confirmed) return;

    Promise.all(
      selectedOrders.map((orderId) =>
        fetch(`${baseUrl}/api/orders/${orderId}`, { method: "DELETE" })
      )
    )
      .then(() => {
        alert("Đã xóa đơn hàng thành công!");
        setOrders(
          orders.filter((order) => !selectedOrders.includes(order._id))
        );
        setSelectedOrders([]);
      })
      .catch((error) => {
        console.error("Lỗi khi xóa đơn hàng:", error);
        alert("Xóa đơn hàng thất bại.");
      });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <div>Đang tải lịch sử đơn hàng...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h1>
      <div className="mb-4">
        <label>Lọc theo ngày: </label>
        <select value={selectedDate} onChange={handleDateChange}>
          {generateDaysList().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleDeleteSelected}
        disabled={selectedOrders.length === 0}
        className={`mb-4 px-4 py-2 rounded ${
          selectedOrders.length > 0
            ? "bg-red-500 text-white"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
      >
        Xóa Đơn Hàng Đã Chọn
      </button>

      {orders.length === 0 ? (
        <p>Không tìm thấy đơn hàng nào</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order._id} className="mb-4 p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl">Order {order._id.slice(-10)}</h2>
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order._id)}
                  onChange={() => handleSelectOrder(order._id)}
                  className="w-6 h-6 border-2 border-gray-400 rounded"
                />
              </div>
              <p>Thời gian: {new Date(order.date).toLocaleString()}</p>
              <p>
                Phương thức thanh toán:{" "}
                {order.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}
              </p>
              <p>Tổng cộng: {order.total.toLocaleString()} đ</p>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} - {item.price.toLocaleString()} đ x{" "}
                    {item.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default OrderHistoryPage;
