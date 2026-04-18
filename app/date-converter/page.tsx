"use client";

import { useState } from "react";
import { Calendar, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { Solar, Lunar } from "lunar-javascript";

export default function DateConverter() {
  const [solarDate, setSolarDate] = useState({
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [lunarResult, setLunarResult] = useState<any>(null);
  const [lunarDate, setLunarDate] = useState({
    day: 1,
    month: 1,
    year: new Date().getFullYear(),
    leap: false,
  });
  const [solarResult, setSolarResult] = useState<any>(null);

  const handleSolarToLunar = () => {
    try {
      const solar = Solar.fromYmd(
        solarDate.year,
        solarDate.month,
        solarDate.day,
      );
      const lunar = solar.getLunar();

      const result: any = {
        day: lunar.getDay(),
        month: Math.abs(lunar.getMonth()),
        year: lunar.getYear(),
        leap: lunar.getMonth() < 0,
        solarInput: solarDate,
      };

      // Get week of year and day of week
      const startOfYear = new Date(solarDate.year, 0, 1);
      const currentDate = new Date(
        solarDate.year,
        solarDate.month - 1,
        solarDate.day,
      );
      const weekOfYear = Math.ceil(
        ((currentDate.getTime() - startOfYear.getTime()) / 86400000 +
          startOfYear.getDay() +
          1) /
          7,
      );
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayNames = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ];
      const dayName = dayNames[dayOfWeek];

      // Get zodiac animal for lunar year
      const animals = [
        "Tý",
        "Sửu",
        "Dần",
        "Mão",
        "Thìn",
        "Tỵ",
        "Ngọ",
        "Mùi",
        "Thân",
        "Dậu",
        "Tuất",
        "Hợi",
      ];
      const zodiacYear = animals[lunar.getYear() % 12];

      // Simple can chi calculation
      const gan = [
        "Giáp",
        "Ất",
        "Bính",
        "Đinh",
        "Mậu",
        "Kỷ",
        "Canh",
        "Tân",
        "Nhâm",
        "Quý",
      ];
      const chi = [
        "Tý",
        "Sửu",
        "Dần",
        "Mão",
        "Thìn",
        "Tỵ",
        "Ngọ",
        "Mùi",
        "Thân",
        "Dậu",
        "Tuất",
        "Hợi",
      ];
      const yearCanChi = `${gan[(lunar.getYear() - 4) % 10]} ${
        chi[lunar.getYear() % 12]
      }`;

      result.dayInfo = {
        canChi: yearCanChi,
        weekOfYear,
        zodiacYear,
        dayName,
      };

      setLunarResult(result);
    } catch (error) {
      console.error("Lỗi chuyển đổi:", error);
    }
  };

  const handleLunarToSolar = () => {
    try {
      console.log("Converting lunar date:", lunarDate);

      // Try to find solar date by iterating through a wider range
      let foundDate = null;

      // Search within a wider range - use lunar year as base but search solar years around it
      for (let yearOffset = -2; yearOffset <= 2; yearOffset++) {
        const searchYear = lunarDate.year + yearOffset;

        // Search through the entire year
        for (let dayOfYear = 1; dayOfYear <= 366; dayOfYear++) {
          const testDate = new Date(searchYear, 0, 1); // Jan 1st
          testDate.setDate(testDate.getDate() + dayOfYear - 1);

          // Skip if date goes to next year
          if (testDate.getFullYear() !== searchYear) break;

          const testSolar = Solar.fromYmd(
            testDate.getFullYear(),
            testDate.getMonth() + 1,
            testDate.getDate(),
          );
          const testLunar = testSolar.getLunar();

          console.log(
            "Testing:",
            testDate,
            "-> Lunar:",
            testLunar.getDay(),
            Math.abs(testLunar.getMonth()),
            testLunar.getYear(),
          );

          if (
            testLunar.getDay() === lunarDate.day &&
            Math.abs(testLunar.getMonth()) === lunarDate.month &&
            testLunar.getYear() === lunarDate.year
          ) {
            // Check leap month
            const isLeap = testLunar.getMonth() < 0;
            if ((lunarDate.leap && isLeap) || (!lunarDate.leap && !isLeap)) {
              foundDate = testDate;
              console.log("Found match:", foundDate);
              break;
            }
          }
        }

        if (foundDate) break;
      }

      if (!foundDate) {
        throw new Error("Không tìm thấy ngày dương tương ứng");
      }

      const result: any = {
        day: foundDate.getDate(),
        month: foundDate.getMonth() + 1,
        year: foundDate.getFullYear(),
        lunarInput: lunarDate,
      };

      // Get week of year
      const startOfYear = new Date(foundDate.getFullYear(), 0, 1);
      const weekOfYear = Math.ceil(
        ((foundDate.getTime() - startOfYear.getTime()) / 86400000 +
          startOfYear.getDay() +
          1) /
          7,
      );

      // Get zodiac animal for lunar year
      const animals = [
        "Tý",
        "Sửu",
        "Dần",
        "Mão",
        "Thìn",
        "Tỵ",
        "Ngọ",
        "Mùi",
        "Thân",
        "Dậu",
        "Tuất",
        "Hợi",
      ];
      const zodiacYear = animals[lunarDate.year % 12];

      // Can chi for lunar year
      const gan = [
        "Giáp",
        "Ất",
        "Bính",
        "Đinh",
        "Mậu",
        "Kỷ",
        "Canh",
        "Tân",
        "Nhâm",
        "Quý",
      ];
      const chi = [
        "Tý",
        "Sửu",
        "Dần",
        "Mão",
        "Thìn",
        "Tỵ",
        "Ngọ",
        "Mùi",
        "Thân",
        "Dậu",
        "Tuất",
        "Hợi",
      ];
      const yearCanChi = `${gan[(lunarDate.year - 4) % 10]} ${
        chi[lunarDate.year % 12]
      }`;

      result.dayInfo = {
        canChi: yearCanChi,
        weekOfYear,
        zodiacYear,
      };

      console.log("Setting solar result:", result);
      setSolarResult(result);
      setLunarResult(null); // Clear other result
    } catch (error) {
      console.error("Lỗi chuyển đổi:", error);
    }
  };

  const handleSolarInputChange = (
    field: keyof typeof solarDate,
    value: string,
  ) => {
    const numValue = parseInt(value) || 0;
    setSolarDate((prev: any) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleLunarInputChange = (
    field: keyof typeof lunarDate,
    value: string,
  ) => {
    if (field === "leap") {
      setLunarDate((prev: any) => ({
        ...prev,
        [field]: value === "true",
      }));
    } else {
      const numValue = parseInt(value) || 0;
      setLunarDate((prev: any) => ({
        ...prev,
        [field]: numValue,
      }));
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "";
    return `${date.day}/${date.month}/${date.year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Chuyển đổi Dương - Âm lịch
          </h1>
          <p className="text-gray-600">
            Công cụ chuyển đổi ngày dương lịch sang âm lịch và ngược lại chính
            xác
          </p>
        </div>

        {/* Solar to Lunar */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Ngày dương lịch
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={solarDate.day}
                    onChange={(e) =>
                      handleSolarInputChange("day", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tháng
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={solarDate.month}
                    onChange={(e) =>
                      handleSolarInputChange("month", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    value={solarDate.year}
                    onChange={(e) =>
                      handleSolarInputChange("year", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleSolarToLunar}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Chuyển đổi Dương → Âm
              </button>
            </div>

            {/* Result Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Ngày âm lịch
                </h2>
              </div>

              {lunarResult ? (
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-6 space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {formatDate(lunarResult)}
                    </div>
                    {lunarResult.leap && (
                      <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                        Tháng nhuận
                      </span>
                    )}
                  </div>

                  <div className="border-t border-red-200 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Can chi năm:</span>
                      <span className="font-semibold">
                        {lunarResult.dayInfo?.canChi || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Con giáp:</span>
                      <span className="font-semibold">
                        {lunarResult.dayInfo?.zodiacYear || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thuộc tuần:</span>
                      <span className="font-semibold">
                        Tuần {lunarResult.dayInfo?.weekOfYear || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thứ:</span>
                      <span className="font-semibold">
                        {lunarResult.dayInfo?.dayName || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-sm text-gray-600">
                    <p>
                      <strong>Ngày dương:</strong>{" "}
                      {formatDate(lunarResult.solarInput)}
                    </p>
                    <p>
                      <strong>Ngày âm:</strong> {formatDate(lunarResult)}{" "}
                      {lunarResult.leap ? "(tháng nhuận)" : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nhập ngày dương lịch và bấm "Chuyển đổi" để xem kết quả</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lunar to Solar */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Ngày âm lịch
                </h2>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={lunarDate.day}
                    onChange={(e) =>
                      handleLunarInputChange("day", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tháng
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={lunarDate.month}
                    onChange={(e) =>
                      handleLunarInputChange("month", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    value={lunarDate.year}
                    onChange={(e) =>
                      handleLunarInputChange("year", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhuận
                  </label>
                  <select
                    value={lunarDate.leap ? "true" : "false"}
                    onChange={(e) =>
                      handleLunarInputChange("leap", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="false">Không</option>
                    <option value="true">Có</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleLunarToSolar}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Chuyển đổi Âm → Dương
              </button>
            </div>

            {/* Result Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Ngày dương lịch
                </h2>
              </div>

              {solarResult ? (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {formatDate(solarResult)}
                    </div>
                  </div>

                  <div className="border-t border-orange-200 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Can chi năm âm:</span>
                      <span className="font-semibold">
                        {solarResult.dayInfo?.canChi || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Con giáp:</span>
                      <span className="font-semibold">
                        {solarResult.dayInfo?.zodiacYear || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thuộc tuần:</span>
                      <span className="font-semibold">
                        Tuần {solarResult.dayInfo?.weekOfYear || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-sm text-gray-600">
                    <p>
                      <strong>Ngày âm:</strong>{" "}
                      {formatDate(solarResult.lunarInput)}
                      {solarResult.lunarInput.leap ? " (tháng nhuận)" : ""}
                    </p>
                    <p>
                      <strong>Ngày dương:</strong> {formatDate(solarResult)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nhập ngày âm lịch và bấm "Chuyển đổi" để xem kết quả</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-amber-800 text-center">
            <strong>Lưu ý:</strong> Ngày 28/02/1965 dương lịch là năm Ất Dậu âm
            lịch. Năm Ất Tỵ gần nhất là Tết năm 1965 dương lịch (khoảng tháng
            2/1965).
          </p>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Hướng dẫn sử dụng
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Cách chuyển đổi:
              </h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Nhập ngày, tháng, năm dương lịch hoặc âm lịch</li>
                <li>Bấm nút "Chuyển đổi" tương ứng</li>
                <li>Xem kết quả chuyển đổi tương ứng</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Lưu ý quan trọng:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Áp dụng múi giờ Việt Nam (UTC+7)</li>
                <li>Hỗ trợ chuyển đổi từ năm 1900-2100</li>
                <li>Tự động nhận diện tháng nhuận</li>
                <li>Hiển thị thêm thông tin can chi, thứ, tuần lễ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
