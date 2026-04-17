"use client";
import React, { useState, useEffect } from "react";

interface AdminPrintConfigProps {
  onConfirm: (config: any) => void;
  onClose: () => void;
}

export default function AdminPrintConfig({ onConfirm, onClose }: AdminPrintConfigProps) {
  const A0_WIDTH_MM = 1189;
  const MARGIN_LR_MM = 40; 
  const GAP_MM = 10;

  const [numLanes, setNumLanes] = useState(3);
  const [laneWidths, setLaneWidths] = useState<number[]>([]);

  const totalUsable = A0_WIDTH_MM - MARGIN_LR_MM - (GAP_MM * (numLanes - 1));

  useEffect(() => {
    const initialWidth = Math.floor(totalUsable / numLanes);
    setLaneWidths(new Array(numLanes).fill(initialWidth));
  }, [numLanes, totalUsable]);

  const handleWidthChange = (index: number, val: number) => {
    const newWidths = [...laneWidths];
    newWidths[index] = val;
    setLaneWidths(newWidths);
  };

  const calculateXPositions = () => {
    let currentX = MARGIN_LR_MM / 2;
    return laneWidths.map((w) => {
      const posX = currentX;
      currentX += w + GAP_MM;
      return posX;
    });
  };

  const currentTotal = laneWidths.reduce((a, b) => a + b, 0);
  const isOverSize = currentTotal > totalUsable + 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border-t-4 border-amber-600">
        <h2 className="text-xl font-bold text-amber-900 mb-4 uppercase">Cấu hình thông số A0</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2 uppercase text-stone-500">Số lượng chi (Khoang):</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button key={n} onClick={() => setNumLanes(n)}
                className={`flex-1 py-2 rounded-md border-2 transition-all ${numLanes === n ? "border-amber-600 bg-amber-50 text-amber-700 font-bold" : "border-stone-200 bg-white"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Điều chỉnh độ rộng (mm)</p>
          {laneWidths.map((w, i) => (
            <div key={i} className="flex items-center justify-between bg-stone-50 p-3 rounded-lg border border-stone-200">
              <span className="font-bold text-stone-600">Khoang {i + 1}</span>
              <div className="flex items-center gap-2">
                <input type="number" value={w} onChange={(e) => handleWidthChange(i, Number(e.target.value))}
                  className="w-20 text-center bg-transparent border-b-2 border-amber-500 focus:outline-none font-mono text-lg font-bold" />
                <span className="text-stone-400 font-bold">mm</span>
              </div>
            </div>
          ))}
        </div>

        {isOverSize && <p className="text-red-500 text-xs mb-4 font-bold">⚠️ Tổng {currentTotal}mm vượt quá giới hạn A0!</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-stone-500 hover:bg-stone-100 rounded-lg">HỦY BỎ</button>
          <button disabled={isOverSize} onClick={() => onConfirm({ numLanes, laneWidths, laneXPositions: calculateXPositions() })}
            className="flex-[2] bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 disabled:bg-stone-300">
            XÁC NHẬN CHIẾT XUẤT
          </button>
        </div>
      </div>
    </div>
  );
}
