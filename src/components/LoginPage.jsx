import React, { useState } from "react";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://coutnhatrang-api.vercel.app/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }), // Send username and password to the backend
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("role", data.role); // Store the user's role in localStorage
        onLogin(data.role); // Notify parent component of login success and user's role
      } else {
        setError(data.message); // Display backend error message
      }
    } catch (error) {
      console.log(error);
      setError("Gặp lỗi khi đăng nhập");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Đăng nhập</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label>Tên tài khoản:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
