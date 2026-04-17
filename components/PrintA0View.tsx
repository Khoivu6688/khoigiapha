"use client";
import React, { useMemo } from "react";

interface PrintA0ViewProps {
  persons: any[];
  config: {
    numLanes: number;
    laneWidths: number[];
    laneXPositions: number[];
  };
}

export default function PrintA0View({ persons, config }: PrintA0ViewProps) {
  const GEN_HEIGHT = 100; 
  const NODE_WIDTH = 60;  
  const NODE_HEIGHT = 22; 

  const nodesWithCoords = useMemo(() => {
    if (!config) return [];
    return persons.map((p) => {
      if (!p.positionId || p.positionId.length < 6) return null;

      const gen = parseInt(p.positionId[0]); 
      const laneIdx = parseInt(p.positionId[1]) - 1; 
      const familyOffset = parseInt(p.positionId.substring(2, 4));
      const subLane = parseInt(p.positionId[4]); 

      const startX = config.laneXPositions[laneIdx];
      const laneW = config.laneWidths[laneIdx];
      
      const posX = startX + (laneW / 4) * subLane;
      const posY = 60 + (gen - 1) * GEN_HEIGHT + (familyOffset * 15);

      return { ...p, x: posX, y: posY, gen };
    }).filter(Boolean);
  }, [persons, config]);

  const coordMap = useMemo(() => {
    const map: any = {};
    nodesWithCoords.forEach((n: any) => { map[n.id] = n; });
    return map;
  }, [nodesWithCoords]);

  if (!config) return <div className="p-20 text-center font-bold">Chưa có cấu hình in...</div>;

  return (
    <div 
      id="print-area"
      style={{ width: '1189mm', height: '841mm' }}
      className="bg-white relative overflow-hidden print:m-0"
    >
      {/* Vạch phân khoang */}
      {config.laneXPositions.map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: `${x}mm`, top: 0, width: `${config.laneWidths[i]}mm`, height: '100%', borderRight: '0.1mm dashed #eee' }} />
      ))}

      {/* SVG Đường nối */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} viewBox="0 0 1189 841">
        {nodesWithCoords.map((child: any) => {
          const parent = coordMap[child.parentId];
          if (!parent) return null;
          const midY = parent.y + (child.y - parent.y) / 2;
          return (
            <path key={`edge-${child.id}`} d={`M ${parent.x} ${parent.y} L ${parent.x} ${midY} L ${child.x} ${midY} L ${child.x} ${child.y}`}
              fill="none" stroke="#666" strokeWidth="0.3" strokeLinejoin="round" />
          );
        })}
      </svg>

      {/* Nút tên */}
      {nodesWithCoords.map((p: any) => (
        <div key={p.id}
          style={{ position: 'absolute', left: `${p.x}mm`, top: `${p.y}mm`, width: `${NODE_WIDTH}mm`, height: `${NODE_HEIGHT}mm`, transform: 'translate(-50%, -50%)', zIndex: 10 }}
          className="border-[0.3mm] border-black bg-white flex flex-col items-center justify-center text-center p-1"
        >
          <div className="text-[11pt] font-bold uppercase leading-none">{p.name}</div>
          <div className="text-[6pt] text-stone-400 mt-1 font-mono">{p.positionId}</div>
        </div>
      ))}
    </div>
  );
}
