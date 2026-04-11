"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Person, Relationship } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Code,
  Filter,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Plus,
  Minus,
} from "lucide-react";
import { useDashboard } from "./DashboardContext";
import ExportButton from "./ExportButton";
import FamilyNodeCard from "./FamilyNodeCard";
import { generateSimpleFamilyTreeHTML } from "@/utils/familyTreeUtils";

export default function FamilyTree({
  personsMap,
  relationships,
  roots,
  branches,
  canEdit,
}: {
  personsMap: Map<string, Person>;
  relationships: Relationship[];
  roots: Person[];
  branches: any[];
  canEdit?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hasDraggedRef = useRef(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });
  const [scale, setScale] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [hideSpouses, setHideSpouses] = useState(false);
  const [hideMales, setHideMales] = useState(false);
  const [hideFemales, setHideFemales] = useState(false);
  const [maxDepth, setMaxDepth] = useState<number>(0);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [isExportingHTML, setIsExportingHTML] = useState(false);

  const { showAvatar, setShowAvatar, setRootId } = useDashboard();
  const filtersRef = useRef<HTMLDivElement>(null);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const [depthPortalNode, setDepthPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalNode(document.getElementById("tree-toolbar-portal"));
    setDepthPortalNode(document.getElementById("tree-depth-portal"));
  }, []);

  // Hàm lấy dữ liệu chuẩn (Không bị ảnh hưởng bởi Filter - Dùng cho Export)
  const getRawTreeData = useCallback((personId: string) => {
    const spouses = relationships
      .filter(r => r.type === "marriage" && (r.person_a === personId || r.person_b === personId))
      .map(r => personsMap.get(r.person_a === personId ? r.person_b : r.person_a))
      .filter(Boolean) as Person[];

    const children = relationships
      .filter(r => (r.type === "biological_child" || r.type === "adopted_child") && r.person_a === personId)
      .map(r => personsMap.get(r.person_b))
      .filter(Boolean) as Person[];
    
    return { person: personsMap.get(personId)!, spouses, children };
  }, [relationships, personsMap]);

  // Hàm lấy dữ liệu hiển thị (Có Filter & Sắp xếp lại chuẩn 6, 7, 8)
  const getDisplayData = (personId: string) => {
    const data = getRawTreeData(personId);
    
    const filteredSpouses = data.spouses.filter(s => {
      if (hideSpouses) return false;
      if (hideMales && s.gender === "male") return false;
      if (hideFemales && s.gender === "female") return false;
      return true;
    });

    const sortedChildren = data.children
      .filter(c => {
        if (hideMales && c.gender === "male") return false;
        if (hideFemales && c.gender === "female") return false;
        return true;
      })
      .sort((a, b) => {
        // Ép kiểu số để so sánh chính xác birth_order
        const orderA = a.birth_order !== null ? Number(a.birth_order) : 999;
        const orderB = b.birth_order !== null ? Number(b.birth_order) : 999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.birth_year || 9999) - (b.birth_year || 9999);
      });

    return { ...data, spouses: filteredSpouses, children: sortedChildren };
  };

  const exportSimpleHTML = async () => {
    try {
      setIsExportingHTML(true);
      const treeData = roots.map(root => {
        const buildNode = (pId: string, vis = new Set<string>(), lvl = 0): any => {
          if (vis.has(pId)) return null;
          vis.add(pId);
          const d = getRawTreeData(pId); // Dùng Raw để xuất file luôn đầy đủ
          return {
            person: d.person,
            spouses: d.spouses,
            children: d.children.map(c => buildNode(c.id, new Set(vis), lvl + 1)).filter(Boolean),
            level: lvl
          };
        };
        return buildNode(root.id);
      }).filter(Boolean);

      const html = generateSimpleFamilyTreeHTML(treeData, branches);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gia-pha-vuba-${new Date().toISOString().split("T")[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error(err); } finally { setIsExportingHTML(false); }
  };

  const renderTreeNode = (personId: string, visited = new Set<string>(), level = 0): React.ReactNode => {
    if (visited.has(personId)) return null;
    visited.add(personId);
    const data = getDisplayData(personId);
    if (!data.person) return null;

    const isCollapsed = collapsedNodeIds.has(personId);
    const hasChildren = (maxDepth === 0 || level < maxDepth - 1) && data.children.length > 0;

    return (
      <li key={personId}>
        <div className="node-container inline-flex flex-col items-center">
          <div className="flex relative z-10 bg-white rounded-2xl shadow-md border border-stone-200/80 items-center gap-0.5 p-0.5">
            <FamilyNodeCard person={data.person} onClickSetRoot={() => setRootId(data.person.id)} />
            {data.spouses.map((s, idx) => (
              <FamilyNodeCard key={s.id} person={s} isRingVisible={idx === 0} role={s.gender === "male" ? "Chồng" : "Vợ"} onClickSetRoot={() => setRootId(s.id)} />
            ))}
            {hasChildren && (
              <div onClick={(e) => { e.stopPropagation(); setCollapsedNodeIds(prev => { const n = new Set(prev); n.has(personId) ? n.delete(personId) : n.add(personId); return n; }); }}
                   className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-stone-200 shadow-sm rounded-full size-6 flex items-center justify-center cursor-pointer z-20 text-stone-400 hover:text-amber-600">
                {isCollapsed ? <Plus className="size-3.5" /> : <Minus className="size-3.5" />}
              </div>
            )}
          </div>
        </div>
        {hasChildren && !isCollapsed && (
          <ul>{data.children.map(child => <React.Fragment key={child.id}>{renderTreeNode(child.id, new Set(visited), level + 1)}</React.Fragment>)}</ul>
        )}
      </li>
    );
  };

  // Logic Drag & Scroll (Giữ nguyên bản gốc của anh nhưng tối ưu chặn click nhầm)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPressed(true); hasDraggedRef.current = false;
    setDragStart({ x: e.pageX, y: e.pageY });
    if (containerRef.current) setScrollStart({ left: containerRef.current.scrollLeft, top: containerRef.current.scrollTop });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPressed || !containerRef.current) return;
    const dx = e.pageX - dragStart.x;
    const dy = e.pageY - dragStart.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) { setIsDragging(true); hasDraggedRef.current = true; }
    if (hasDraggedRef.current) {
      containerRef.current.scrollLeft = scrollStart.left - dx;
      containerRef.current.scrollTop = scrollStart.top - dy;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-stone-50">
      <style dangerouslySetInnerHTML={{ __html: `
        .css-tree ul { padding-top: 20px; display: flex; justify-content: center; position: relative; }
        .css-tree li { list-style: none; position: relative; padding: 20px 5px 0 5px; float: left; }
        .css-tree li::before, .css-tree li::after { content: ''; position: absolute; top: 0; right: 50%; border-top: 2px solid #d6d3d1; width: 50%; height: 20px; }
        .css-tree li::after { right: auto; left: 50%; border-left: 2px solid #d6d3d1; }
        .css-tree li:only-child::after { display: none; }
        .css-tree li:only-child::before { content: ''; position: absolute; top: 0; left: 50%; border-left: 2px solid #d6d3d1; height: 20px; width: 0; }
        .css-tree ul:first-child > li { padding-top: 0; }
        .css-tree ul:first-child > li::before, .css-tree ul:first-child > li::after { display: none; }
        .css-tree li:first-child::before, .css-tree li:last-child::after { border: 0 none; }
        .css-tree li:last-child::before { border-right: 2px solid #d6d3d1; border-radius: 0 10px 0 0; }
        .css-tree li:first-child::after { border-radius: 10px 0 0 0; }
        .css-tree ul ul::before { content: ''; position: absolute; top: 0; left: 50%; border-left: 2px solid #d6d3d1; height: 20px; width: 0; }
      `}} />

      {/* PORTALS (Toolbar) */}
      {depthPortalNode && createPortal(
        <div className="flex items-center gap-2 bg-white/90 border border-stone-200 px-3 h-10 rounded-full shadow-sm">
          <span className="text-sm font-bold text-stone-500">Đời:</span>
          <input type="number" value={maxDepth || ""} onChange={e => setMaxDepth(Number(e.target.value))} className="w-8 text-center bg-transparent text-amber-700 font-bold outline-none" placeholder="∞" />
        </div>, depthPortalNode
      )}

      {portalNode && createPortal(
        <div className="flex items-center gap-2" ref={filtersRef}>
          <div className="flex bg-white/90 border border-stone-200 rounded-full h-10 overflow-hidden shadow-sm">
            <button onClick={handleZoomOut} className="px-3 hover:bg-stone-100"><ZoomOut className="size-4" /></button>
            <button onClick={() => setScale(1)} className="px-2 border-x text-xs font-bold min-w-[50px]">{Math.round(scale * 100)}%</button>
            <button onClick={handleZoomIn} className="px-3 hover:bg-stone-100"><ZoomIn className="size-4" /></button>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`h-10 px-4 rounded-full border flex items-center gap-2 font-bold text-sm ${showFilters ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-white text-stone-600 border-stone-200'}`}><Filter className="size-4" /> Lọc</button>
          <button onClick={exportSimpleHTML} className="h-10 px-4 rounded-full bg-white border border-stone-200 font-bold text-sm flex items-center gap-2"><Code className="size-4" /> HTML</button>
          <ExportButton treeData={roots} branches={branches} />
          
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-12 right-0 bg-white border border-stone-200 shadow-xl rounded-2xl p-4 w-48 z-50 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={!showAvatar} onChange={() => setShowAvatar(!showAvatar)} /> Ẩn chân dung</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={hideSpouses} onChange={e => setHideSpouses(e.target.checked)} /> Ẩn dâu/rể</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={hideMales} onChange={e => setHideMales(e.target.checked)} /> Ẩn Nam</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={hideFemales} onChange={e => setHideFemales(e.target.checked)} /> Ẩn Nữ</label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>, portalNode
      )}

      <div ref={containerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => setIsPressed(false)} onMouseLeave={() => setIsPressed(false)}
           className={`w-full h-full overflow-auto p-10 ${isPressed ? 'cursor-grabbing' : 'cursor-grab'}`}
           onClickCapture={e => { if (hasDraggedRef.current) { e.preventDefault(); e.stopPropagation(); } }}>
        <div id="export-container" className="css-tree w-max min-w-full mx-auto" style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
          <ul>{roots.map(root => <React.Fragment key={root.id}>{renderTreeNode(root.id)}</React.Fragment>)}</ul>
        </div>
      </div>
    </div>
  );
}
