import React from "react";

const OrderHistoryPage = ({ orders }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lịch sử đặt hàng</h1>
      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào.</p>
      ) : (
        <ul>
          {orders.map((order, index) => (
            <li key={index} className="mb-4 p-4 border rounded">
              <h2 className="text-xl">Đơn hàng {index + 1}</h2>
              <p>Thời gian: {new Date(order.date).toLocaleString()}</p>
              <p>
                Phương thức thanh toán:{" "}
                {order.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}
              </p>
              <p>Tổng tiền: {order.total.toLocaleString()} đ</p>
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
