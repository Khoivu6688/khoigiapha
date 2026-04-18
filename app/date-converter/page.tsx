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

  // =========================
  // DƯƠNG → ÂM
  // =========================
  const handleSolarToLunar = () => {
    try {
      const solar = Solar.fromYmd(
        solarDate.year,
        solarDate.month,
        solarDate.day
      );

      const lunar: any = solar.getLunar(); // ✅ FIX TS

      const currentDate = new Date(
        solarDate.year,
        solarDate.month - 1,
        solarDate.day
      );

      const startOfYear = new Date(solarDate.year, 0, 1);
      const weekOfYear = Math.ceil(
        ((currentDate.getTime() - startOfYear.getTime()) / 86400000 +
          startOfYear.getDay() +
          1) /
          7
      );

      const dayNames = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ];

      const result = {
        day: lunar.getDay(),
        month: Math.abs(lunar.getMonth()),
        year: lunar.getYear(),
        leap: lunar.getMonth() < 0,
        solarInput: solarDate,

        dayInfo: {
          // ✅ dùng lib chuẩn
          canChiYear: lunar.getYearInGanZhi(),
          canChiMonth: lunar.getMonthInGanZhi(),
          canChiDay: lunar.getDayInGanZhi(),

          zodiacYear: lunar.getYearShengXiao(),

          weekOfYear,
          dayName: dayNames[currentDate.getDay()],
        },
      };

      setLunarResult(result);
      setSolarResult(null);
    } catch (error) {
      console.error("Lỗi chuyển đổi:", error);
    }
  };

  // =========================
  // ÂM → DƯƠNG
  // =========================
  const handleLunarToSolar = () => {
    try {
      const lunar: any = Lunar.fromYmd(
        lunarDate.year,
        lunarDate.leap ? -lunarDate.month : lunarDate.month,
        lunarDate.day
      ); // ✅ FIX TS

      const solar = lunar.getSolar();

      const foundDate = new Date(
        solar.getYear(),
        solar.getMonth() - 1,
        solar.getDay()
      );

      const startOfYear = new Date(foundDate.getFullYear(), 0, 1);
      const weekOfYear = Math.ceil(
        ((foundDate.getTime() - startOfYear.getTime()) / 86400000 +
          startOfYear.getDay() +
          1) /
          7
      );

      const result = {
        day: solar.getDay(),
        month: solar.getMonth(),
        year: solar.getYear(),
        lunarInput: lunarDate,

        dayInfo: {
          canChiYear: lunar.getYearInGanZhi(),
          canChiMonth: lunar.getMonthInGanZhi(),
          canChiDay: lunar.getDayInGanZhi(),

          zodiacYear: lunar.getYearShengXiao(),
          weekOfYear,
        },
      };

      setSolarResult(result);
      setLunarResult(null);
    } catch (error) {
      console.error("Lỗi chuyển đổi:", error);
    }
  };

  const handleSolarInputChange = (field: any, value: string) => {
    const numValue = parseInt(value) || 0;
    setSolarDate((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleLunarInputChange = (field: any, value: string) => {
    if (field === "leap") {
      setLunarDate((prev) => ({
        ...prev,
        leap: value === "true",
      }));
    } else {
      const numValue = parseInt(value) || 0;
      setLunarDate((prev) => ({
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
        </div>

        {/* ===== DƯƠNG → ÂM ===== */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <button
            onClick={handleSolarToLunar}
            className="w-full bg-orange-500 text-white py-3 rounded-lg"
          >
            Chuyển đổi Dương → Âm
          </button>

          {lunarResult && (
            <div className="mt-6 space-y-1">
              <h3 className="text-xl font-bold">
                {formatDate(lunarResult)}
              </h3>

              <p>Can chi năm: {lunarResult.dayInfo.canChiYear}</p>
              <p>Can chi tháng: {lunarResult.dayInfo.canChiMonth}</p>
              <p>Can chi ngày: {lunarResult.dayInfo.canChiDay}</p>
              <p>Con giáp: {lunarResult.dayInfo.zodiacYear}</p>
            </div>
          )}
        </div>

        {/* ===== ÂM → DƯƠNG ===== */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={handleLunarToSolar}
            className="w-full bg-red-500 text-white py-3 rounded-lg"
          >
            Chuyển đổi Âm → Dương
          </button>

          {solarResult && (
            <div className="mt-6 space-y-1">
              <h3 className="text-xl font-bold">
                {formatDate(solarResult)}
              </h3>

              <p>Can chi năm: {solarResult.dayInfo.canChiYear}</p>
              <p>Can chi tháng: {solarResult.dayInfo.canChiMonth}</p>
              <p>Can chi ngày: {solarResult.dayInfo.canChiDay}</p>
              <p>Con giáp: {solarResult.dayInfo.zodiacYear}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
