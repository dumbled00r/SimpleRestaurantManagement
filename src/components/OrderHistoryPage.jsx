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
    return <div>Loading order history...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map((order, index) => (
            <li key={index} className="mb-4 p-4 border rounded">
              <h2 className="text-xl">Order {index + 1}</h2>
              <p>Date: {new Date(order.date).toLocaleString()}</p>
              <p>
                Payment Method:{" "}
                {order.paymentMethod === "cash" ? "Cash" : "Bank Transfer"}
              </p>
              <p>Total: {order.total.toLocaleString()} đ</p>
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
