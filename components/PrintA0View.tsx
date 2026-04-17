"use client";
import React from "react";
import { Person, Relationship } from "@/types";

interface PrintA0ViewProps {
  persons: Person[];
  config: {
    numLanes: number;
    laneWidths: number[];
    laneXPositions: number[];
  };
}

export default function PrintA0View({ persons, config }: PrintA0ViewProps) {
  const GEN_HEIGHT = 100; // Mỗi đời cao 100mm
  const NODE_WIDTH = 60;  // Mỗi nút rộng 60mm

  return (
    <div className="bg-stone-200 p-10 min-h-screen overflow-auto flex justify-center">
      {/* Khung giấy A0 */}
      <div 
        id="print-area"
        style={{ width: '1189mm', height: '841mm' }}
        className="bg-white shadow-2xl relative overflow-hidden p-[20mm] border border-stone-300"
      >
        {/* Vẽ các vạch phân khoang */}
        {config.laneXPositions.map((x, i) => (
          <div 
            key={i}
            style={{ 
              position: 'absolute', 
              left: `${x}mm`, 
              top: '20mm', 
              width: `${config.laneWidths[i]}mm`, 
              height: '801mm',
              borderLeft: '1px dashed #e5e7eb'
            }}
          >
            <div className="text-[20pt] font-black text-stone-200 rotate-90 absolute -left-6 top-10 origin-left">
              CHI CỤ {i + 1}
            </div>
          </div>
        ))}

        {/* Render Thành viên dựa trên positionId: 123456 */}
        {persons.map((p) => {
          if (!p.positionId || p.positionId.length < 6) return null;

          const gen = parseInt(p.positionId[0]); // Đời
          const laneIdx = parseInt(p.positionId[1]) - 1; // Khoang
          const familyOffset = parseInt(p.positionId.substring(2, 4)); // Thứ tự trong khoang
          const subLane = parseInt(p.positionId[4]); // Làn phụ (1-3)

          // Tính tọa độ mm
          const startX = config.laneXPositions[laneIdx];
          const laneW = config.laneWidths[laneIdx];
          
          // X: Căn giữa theo subLane (1: trái, 2: giữa, 3: phải)
          const posX = startX + (laneW / 4) * subLane;
          // Y: Theo đời và thứ tự gia đình
          const posY = 50 + (gen - 1) * GEN_HEIGHT + (familyOffset * 10);

          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${posX}mm`,
                top: `${posY}mm`,
                width: `${NODE_WIDTH}mm`,
                transform: 'translateX(-50%)',
              }}
              className="border-2 border-stone-800 bg-white p-2 text-center flex flex-col items-center justify-center shadow-sm"
            >
              <div className="text-[14pt] font-bold leading-tight">{p.name}</div>
              <div className="text-[9pt] text-stone-500 uppercase font-medium">Đời {gen} - {p.positionId}</div>
            </div>
          );
        })}

        {/* SVG Layer để vẽ đường nối (Connectors) */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
           {/* Logic vẽ đường nối bằng thẻ <path d={`M ${x1} ${y1} L ${x2} ${y2}`} /> */}
        </svg>
      </div>
    </div>
  );
}
