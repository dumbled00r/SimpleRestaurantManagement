import React, { useEffect, useState } from "react";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const baseUrl = "https://simplerestaurantmanagement.onrender.com";
  useEffect(() => {
    fetch(`${baseUrl}/api/orders`)
      .then((response) => response.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching order history:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Đang tải lịch sử đơn hàng</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h1>
      {orders.length === 0 ? (
        <p>Không tìm thấy đơn hàng nào</p>
      ) : (
        <ul>
          {orders.map((order, index) => (
            <li key={index} className="mb-4 p-4 border rounded">
              <h2 className="text-xl">Order {index + 1}</h2>
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
    </div>
  );
};

export default OrderHistoryPage;
