import React, { useEffect, useState } from "react";

// Hàm để tạo danh sách các tháng với định dạng MM/yyyy
const generateMonthsList = () => {
  const months = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(currentYear, i);
    const formattedMonth = `${String(i + 1).padStart(2, "0")}/${currentYear}`; // Định dạng MM/yyyy
    months.push({
      value: `${currentYear}-${String(i + 1).padStart(2, "0")}`, // Properly formatted YYYY-MM for backend
      label: formattedMonth, // Display format: MM/yyyy
    });
  }
  return months;
};

// Hàm để tạo danh sách các ngày với định dạng dd/MM/yyyy
const generateDaysList = () => {
  const days = [];
  const currentDate = new Date();
  for (let i = 0; i < 30; i++) {
    const day = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000); // Lấy ngày trong 30 ngày qua
    const formattedDay = `${String(day.getDate()).padStart(2, "0")}/${String(
      day.getMonth() + 1
    ).padStart(2, "0")}/${day.getFullYear()}`; // Định dạng dd/MM/yyyy
    days.push({
      value: day.toISOString().slice(0, 10), // Use ISO for backend
      label: formattedDay, // Display format: dd/MM/yyyy
    });
  }
  return days;
};

const StatisticsPage = () => {
  const [statistics, setStatistics] = useState(null); // Đặt state ban đầu là null
  const [loading, setLoading] = useState(true); // Biến loading để theo dõi trạng thái tải
  const [filterType, setFilterType] = useState("day"); // Kiểu filter: 'day' hoặc 'month'
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  ); // Ngày hiện tại làm giá trị mặc định

  const fetchStatistics = (filterType, selectedDate) => {
    if (!selectedDate) {
      console.log("Không có giá trị ngày/tháng được chọn.");
      return;
    }

    const baseUrl = "https://simplerestaurantmanagement.onrender.com";
    let url = `${baseUrl}/api/statistics?${filterType}=${selectedDate}`;
    console.log("Fetching from URL:", url); // Log URL để kiểm tra

    setLoading(true);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Dữ liệu thống kê:", data); // Kiểm tra dữ liệu từ API
        setStatistics(data);
        setLoading(false); // Sau khi dữ liệu đã tải, ngừng trạng thái loading
      })
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu thống kê:", error);
        setLoading(false); // Dừng loading khi xảy ra lỗi
      });
  };

  // Gọi API khi component được render lần đầu tiên
  useEffect(() => {
    if (selectedDate) {
      fetchStatistics(filterType, selectedDate);
    }
  }, [selectedDate, filterType]);

  // Hàm định dạng ngày thành dd/MM/yyyy
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Định dạng dd/MM/yyyy
  };

  // Hàm định dạng tháng thành MM/yyyy
  const formatMonth = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    return `${month}/${year}`; // Định dạng MM/yyyy
  };

  // Xử lý khi người dùng thay đổi kiểu filter
  const handleFilterTypeChange = (e) => {
    const newFilterType = e.target.value;
    setFilterType(newFilterType);

    if (newFilterType === "day") {
      const today = new Date();
      setSelectedDate(today.toISOString().slice(0, 10)); // Correct format for backend
    } else if (newFilterType === "month") {
      const currentMonth = new Date();
      setSelectedDate(
        `${currentMonth.getFullYear()}-${String(
          currentMonth.getMonth() + 1
        ).padStart(2, "0")}`
      ); // Properly formatted YYYY-MM for backend
    }
  };

  if (loading) {
    return <div>Đang tải dữ liệu...</div>; // Hiển thị thông báo đang tải
  }

  if (!statistics) {
    console.log("Không có dữ liệu thống kê:", statistics); // Log kiểm tra dữ liệu
    return <div>Không có dữ liệu để hiển thị</div>;
  }

  const { foodSales, cashRevenue, bankTransferRevenue, from, to } = statistics;
  console.log("Hiển thị dữ liệu thống kê:", statistics); // Log dữ liệu trước khi render

  // Danh sách các ngày hoặc tháng để hiển thị trong dropdown
  const dateOptions =
    filterType === "day" ? generateDaysList() : generateMonthsList();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Thống kê doanh thu</h1>

      <div className="mb-4">
        <label>Lọc theo: </label>
        <select value={filterType} onChange={handleFilterTypeChange}>
          <option value="day">Ngày</option>
          <option value="month">Tháng</option>
        </select>

        <label className="ml-4">
          Chọn {filterType === "day" ? "ngày" : "tháng"}:{" "}
        </label>
        <select
          value={selectedDate}
          onChange={(e) => {
            console.log("Ngày hoặc tháng được chọn:", e.target.value); // Log giá trị được chọn
            setSelectedDate(e.target.value);
          }}
        >
          <option value="">
            --Chọn {filterType === "day" ? "ngày" : "tháng"}--
          </option>
          {dateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <h3 className="text-xl mb-2">Số lượng và Doanh thu món ăn</h3>
      {foodSales && Object.keys(foodSales).length > 0 ? (
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Tên món ăn</th>
              <th className="border border-gray-300 px-4 py-2">Số lượng bán</th>
              <th className="border border-gray-300 px-4 py-2">Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(foodSales).map((foodName) => (
              <tr key={foodName} className="border-t border-gray-300">
                <td className="border border-gray-300 px-4 py-2">{foodName}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {foodSales[foodName].sold} lần
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {foodSales[foodName].revenue.toLocaleString()} đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Không có dữ liệu món ăn trong khoảng thời gian này.</p>
      )}

      <h3 className="text-xl mt-4 mb-2">Nguồn thu</h3>
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">
              Phương thức thanh toán
            </th>
            <th className="border border-gray-300 px-4 py-2">Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-gray-300">
            <td className="border border-gray-300 px-4 py-2">Tiền mặt</td>
            <td className="border border-gray-300 px-4 py-2">
              {cashRevenue.toLocaleString()} đ
            </td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="border border-gray-300 px-4 py-2">Chuyển khoản</td>
            <td className="border border-gray-300 px-4 py-2">
              {bankTransferRevenue.toLocaleString()} đ
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex flex-col font-bold text-2xl mt-10">
        <h1>
          Tổng doanh thu:{" "}
          <span>{(cashRevenue + bankTransferRevenue).toLocaleString()} đ</span>
        </h1>
      </div>
    </div>
  );
};

export default StatisticsPage;
