import React, { useState, useEffect } from "react";
import foods from "../data/menu.json"; // Thực đơn từ file JSON
import LoginPage from "./LoginPage"; // Import the login page

const OrderPage = () => {
  const [cart, setCart] = useState([]); // Giỏ hàng
  const [totalPrice, setTotalPrice] = useState(0); // Tổng giá trị giỏ hàng
  const [paymentMethod, setPaymentMethod] = useState("cash"); // Phương thức thanh toán
  const [newFoodName, setNewFoodName] = useState(""); // Tên món ăn ngoài menu
  const [newFoodPrice, setNewFoodPrice] = useState(""); // Giá món ăn ngoài menu
  const [showScrollButton, setShowScrollButton] = useState(false); // Hiển thị nút cuộn lên đầu
  const [loggedIn, setLoggedIn] = useState(false); // Track login status
  const cartRef = React.createRef(); // Reference to the cart section

  // Check if user is logged in (read from localStorage)
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    setLoggedIn(isLoggedIn);
  }, []);

  // Hàm xử lý đăng nhập thành công
  const handleLogin = () => {
    setLoggedIn(true);
  };

  // Nhóm món ăn theo category
  const groupedFoods = foods.reduce((acc, food) => {
    if (!acc[food.category]) acc[food.category] = [];
    acc[food.category].push(food);
    return acc;
  }, {});

  // Tính tổng giá trị giỏ hàng mỗi khi giỏ hàng thay đổi
  useEffect(() => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total); // Cập nhật tổng giá trị giỏ hàng
  }, [cart]);

  // Tính tổng số lượng món ăn trong giỏ hàng
  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Hiển thị nút cuộn lên đầu khi cuộn xuống quá một mức nào đó
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hàm thêm món ăn có sẵn trong menu vào giỏ hàng (số lượng mặc định là 1)
  const handleAddToCart = (food) => {
    const existingFood = cart.find((item) => item.id === food.id);
    if (existingFood) {
      const updatedCart = cart.map((item) =>
        item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...food, quantity: 1 }]); // Thêm món với số lượng mặc định là 1
    }
  };

  // Hàm thêm món ăn ngoài menu vào giỏ hàng
  const handleAddNewFoodToCart = () => {
    if (!newFoodName || newFoodPrice <= 0) {
      alert("Vui lòng nhập tên món ăn và giá hợp lệ.");
      return;
    }

    const newFood = {
      id: Date.now(), // Unique ID for new food item
      name: newFoodName,
      price: Number(newFoodPrice),
      quantity: 1, // Số lượng mặc định là 1
    };
    setCart([...cart, newFood]);

    // Reset input fields
    setNewFoodName("");
    setNewFoodPrice("");
  };

  // Hàm tăng số lượng món ăn
  const increaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updatedCart);
  };

  // Hàm giảm số lượng món ăn
  const decreaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCart(updatedCart);
  };

  // Hàm xóa món ăn khỏi giỏ hàng
  const removeItemFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
  };

  // Hàm xử lý thanh toán
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    const order = {
      items: cart,
      total: totalPrice,
      paymentMethod: paymentMethod,
      date: new Date().toISOString(),
    };

    // Gửi yêu cầu thanh toán (POST) đến server
    fetch(`https://coutnhatrang-api.vercel.app/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order), // Gửi giỏ hàng và tổng giá trị
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Lỗi khi thanh toán");
        }
        return response.json();
      })
      .then((data) => {
        alert("Thanh toán thành công!");
        setCart([]); // Reset giỏ hàng sau khi thanh toán
      })
      .catch((error) => {
        console.error("Lỗi khi thanh toán:", error);
      });
  };

  // Hàm cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hàm cuộn xuống giỏ hàng
  const scrollToCart = () => {
    cartRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // Nếu người dùng chưa đăng nhập, hiển thị trang đăng nhập
  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Order đồ ăn</h1>

      {/* Hiển thị món ăn theo danh mục */}
      {Object.keys(groupedFoods).map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-bold mb-4">{category}</h2>
          <div className="grid grid-cols-1 gap-4 mb-4">
            {groupedFoods[category].map((food) => (
              <div
                key={food.id}
                className="flex items-center justify-between p-4 border rounded"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{food.name}</span>
                  <span>{food.price.toLocaleString()} đ</span>
                </div>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={() => handleAddToCart(food)}
                >
                  Thêm vào giỏ
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Thêm món ăn ngoài menu */}
      <div className="mb-4">
        <h3 className="text-xl mb-2">Thêm món ăn ngoài menu</h3>
        <input
          type="text"
          value={newFoodName}
          onChange={(e) => setNewFoodName(e.target.value)}
          placeholder="Tên món ăn"
          className="border p-2 mr-2"
        />
        <input
          type="number"
          value={newFoodPrice}
          onChange={(e) => setNewFoodPrice(e.target.value)}
          placeholder="Giá món ăn"
          className="border p-2 mr-2"
        />
        <button
          onClick={handleAddNewFoodToCart}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Thêm nhanh
        </button>
      </div>

      {/* Giỏ hàng */}
      <div className="mt-4" ref={cartRef}>
        <h2 className="text-xl mb-2">Giỏ hàng</h2>
        {cart.length === 0 ? (
          <p>Giỏ hàng trống.</p>
        ) : (
          <ul>
            {cart.map((item, index) => (
              <li key={index} className="mb-2">
                <span>
                  {item.name}: {item.price.toLocaleString()} đ x {item.quantity}
                </span>
                <div className="flex items-center mt-2">
                  <button
                    className="bg-red-500 text-white px-2 py-1 mr-2"
                    onClick={() => decreaseQuantity(item.id)}
                  >
                    –
                  </button>
                  <button
                    className="bg-green-500 text-white px-2 py-1 mr-2"
                    onClick={() => increaseQuantity(item.id)}
                  >
                    +
                  </button>
                  <button
                    className="bg-gray-500 text-white px-2 py-1"
                    onClick={() => removeItemFromCart(item.id)}
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Hiển thị tổng thanh toán */}
        <div className="mt-4">
          <h3 className="text-xl">
            Tổng cộng: {totalPrice.toLocaleString()} đ
          </h3>
        </div>
      </div>

      {/* Thanh toán */}
      <div className="mt-4">
        <h2 className="text-xl mb-2">Thanh toán</h2>
        <label>Phương thức thanh toán:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="border p-2 mb-4"
        >
          <option value="cash">Tiền mặt</option>
          <option value="bank">Chuyển khoản</option>
        </select>

        <h3 className="text-xl mb-2">
          Tổng tiền: {totalPrice.toLocaleString()} đ
        </h3>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleCheckout}
        >
          Xác nhận thanh toán
        </button>
      </div>

      {/* Nút cuộn lên đầu và giỏ hàng */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-4">
        {showScrollButton && (
          <button
            onClick={scrollToTop}
            className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg"
          >
            🡅
          </button>
        )}

        {/* Nút giỏ hàng */}
        {cart.length > 0 && (
          <div className="relative">
            <button
              onClick={scrollToCart}
              className="bg-white text-white px-4 py-2 rounded-full shadow-lg"
            >
              🛒
            </button>
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
              {totalItemsInCart}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
