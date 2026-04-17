"use client";
import React, { useMemo } from "react";

interface Person {
  id: string;
  name: string;
  positionId: string; // Định dạng: 123456
  parentId?: string;
}

interface PrintA0ViewProps {
  persons: Person[];
  config: {
    numLanes: number;
    laneWidths: number[];
    laneXPositions: number[];
  };
}

export default function PrintA0View({ persons, config }: PrintA0ViewProps) {
  const GEN_HEIGHT = 100; // Khoảng cách giữa các đời (mm)
  const NODE_WIDTH = 60;  // Chiều rộng nút (mm)
  const NODE_HEIGHT = 25; // Chiều cao nút (mm)

  // 1. Tính toán tọa độ thực tế (mm) cho từng người dựa trên positionId
  const nodesWithCoords = useMemo(() => {
    return persons.map((p) => {
      if (!p.positionId || p.positionId.length < 6) return null;

      const gen = parseInt(p.positionId[0]); 
      const laneIdx = parseInt(p.positionId[1]) - 1; 
      const familyOffset = parseInt(p.positionId.substring(2, 4));
      const subLane = parseInt(p.positionId[4]); // 1: trái, 2: giữa, 3: phải

      const startX = config.laneXPositions[laneIdx];
      const laneW = config.laneWidths[laneIdx];
      
      // X: Tính theo subLane bên trong khoang
      const posX = startX + (laneW / 4) * subLane;
      // Y: Tính theo đời và offset gia đình
      const posY = 60 + (gen - 1) * GEN_HEIGHT + (familyOffset * 15);

      return { ...p, x: posX, y: posY, gen };
    }).filter(Boolean);
  }, [persons, config]);

  // 2. Tạo bản đồ tra cứu tọa độ nhanh
  const coordMap = useMemo(() => {
    const map: any = {};
    nodesWithCoords.forEach((n: any) => { map[n.id] = n; });
    return map;
  }, [nodesWithCoords]);

  return (
    <div className="bg-stone-100 p-8 min-h-screen overflow-auto flex justify-center print:p-0">
      <div 
        id="print-area"
        style={{ width: '1189mm', height: '841mm' }}
        className="bg-white shadow-2xl relative overflow-hidden border border-stone-300 print:shadow-none"
      >
        {/* Lớp nền: Vạch phân khoang */}
        {config.laneXPositions.map((x, i) => (
          <div 
            key={i}
            style={{ 
              position: 'absolute', left: `${x}mm`, top: 0, 
              width: `${config.laneWidths[i]}mm`, height: '100%',
              borderRight: '1px dashed #efefef', backgroundColor: i % 2 === 0 ? '#fafafa' : 'white'
            }}
          >
            <div className="absolute top-4 left-4 text-stone-300 font-black text-4xl opacity-50">
              KHOANG {i + 1}
            </div>
          </div>
        ))}

        {/* Lớp giữa: Vẽ đường nối SVG */}
        <svg 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          viewBox="0 0 1189 841"
        >
          {nodesWithCoords.map((child: any) => {
            const parent = coordMap[child.parentId];
            if (!parent) return null;

            // Tọa độ các điểm nối (mm)
            const x1 = parent.x;
            const y1 = parent.y + NODE_HEIGHT / 2;
            const x2 = child.x;
            const y2 = child.y - NODE_HEIGHT / 2;
            const midY = y1 + (y2 - y1) / 2; // Điểm gãy vuông góc

            return (
              <path
                key={`edge-${child.id}`}
                d={`M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`}
                fill="none"
                stroke="#444"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>

        {/* Lớp trên cùng: Các nút thành viên */}
        {nodesWithCoords.map((p: any) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}mm`,
              top: `${p.y}mm`,
              width: `${NODE_WIDTH}mm`,
              height: `${NODE_HEIGHT}mm`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
            className="border-[0.5mm] border-black bg-white flex flex-col items-center justify-center p-1"
          >
            <div className="text-[12pt] font-bold leading-tight uppercase">{p.name}</div>
            <div className="text-[7pt] text-stone-500 font-mono mt-0.5">
              ID: {p.positionId}
            </div>
          </div>
        ))}

        {/* Thông tin chân trang bản in */}
        <div className="absolute bottom-10 right-10 text-right">
          <h2 className="text-2xl font-serif font-bold text-stone-800">SƠ ĐỒ GIA PHẢ DÒNG HỌ</h2>
          <p className="text-sm text-stone-500 italic">Khổ in A0 (1189x841mm) - Xuất bản năm 2024</p>
        </div>
      </div>
    </div>
  );
}
