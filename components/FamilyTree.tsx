"use client";

import React, { useEffect, useRef, useState } from "react";
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

interface SpouseData {
  person: Person;
  note?: string | null;
}

export default function FamilyTree({
  personsMap,
  relationships,
  roots,
}: {
  personsMap: Map<string, Person>;
  relationships: Relationship[];
  roots: Person[];
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
  const [maxDepth, setMaxDepth] = useState<number>(0);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());

  const { showAvatar, setShowAvatar, setRootId } = useDashboard();
  const filtersRef = useRef<HTMLDivElement>(null);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const [depthPortalNode, setDepthPortalNode] = useState<HTMLElement | null>(null);
  const [isExportingHTML, setIsExportingHTML] = useState(false);

  useEffect(() => {
    setPortalNode(document.getElementById("tree-toolbar-portal"));
    setDepthPortalNode(document.getElementById("tree-depth-portal"));
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.3));
  const handleResetZoom = () => setScale(1);

  const exportSimpleHTML = async () => {
    setIsExportingHTML(true);
    try {
      const html = generateSimpleFamilyTreeHTML(roots, personsMap, relationships);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gia-pha-${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExportingHTML(false);
    }
  };

  const getTreeData = (personId: string) => {
    const spousesList: SpouseData[] = relationships
      .filter((r) => r.type === "marriage" && (r.person_a === personId || r.person_b === personId))
      .map((r) => {
        const spouseId = r.person_a === personId ? r.person_b : r.person_a;
        return { person: personsMap.get(spouseId)!, note: r.note };
      })
      .filter((s) => s.person && !hideSpouses);

    const childRels = relationships.filter((r) => (r.type === "biological_child" || r.type === "adopted_child") && r.person_a === personId);

    const childrenList = (childRels.map((r) => personsMap.get(r.person_b)).filter(Boolean) as Person[])
      .sort((a, b) => {
        // CẬP NHẬT QUAN TRỌNG: Xử lý 8 đứng trước 3 người Null
        const aOrder = a.birth_order;
        const bOrder = b.birth_order;
        if (aOrder !== null && bOrder !== null) return aOrder - bOrder;
        if (aOrder !== null && bOrder === null) return -1;
        if (aOrder === null && bOrder !== null) return 1;
        const aYear = a.birth_year ?? 9999;
        const bYear = b.birth_year ?? 9999;
        return aYear - bYear;
      });

    return { person: personsMap.get(personId)!, spouses: spousesList, children: childrenList };
  };

  const renderTreeNode = (personId: string, visited: Set<string> = new Set(), level: number = 0): React.ReactNode => {
    if (visited.has(personId)) return null;
    visited.add(personId);
    const data = getTreeData(personId);
    if (!data.person) return null;

    const hasChildren = maxDepth > 0 && level >= maxDepth - 1 ? false : data.children.length > 0;
    const isCollapsed = collapsedNodeIds.has(personId);

    return (
      <li>
        <div className="node-container inline-flex flex-col items-center">
          <div className="flex relative z-10 bg-white rounded-2xl shadow-md border border-stone-200/80">
            <FamilyNodeCard person={data.person} onClickSetRoot={() => setRootId(data.person.id)} />
            {data.spouses.map((spouseData, idx) => (
              <FamilyNodeCard 
                key={spouseData.person.id} 
                isRingVisible={idx === 0} 
                person={spouseData.person} 
                role={spouseData.person.gender === "male" ? "Chồng" : "Vợ"} 
                note={spouseData.note} 
                onClickSetRoot={() => setRootId(spouseData.person.id)} 
              />
            ))}
            {hasChildren && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-stone-200/80 rounded-full size-6 flex items-center justify-center shadow-md z-10 cursor-pointer text-stone-500 hover:text-amber-600 transition-colors" 
                   onClick={(e) => { e.stopPropagation(); setCollapsedNodeIds(prev => { const n = new Set(prev); n.has(personId) ? n.delete(personId) : n.add(personId); return n; }); }}>
                {!isCollapsed ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </div>
            )}
          </div>
        </div>
        {hasChildren && !isCollapsed && (
          <ul>
            {data.children.map((child) => (
              <React.Fragment key={child.id}>{renderTreeNode(child.id, new Set(visited), level + 1)}</React.Fragment>
            ))}
          </ul>
        )}
      </li>
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPressed(true);
    hasDraggedRef.current = false;
    setDragStart({ x: e.pageX, y: e.pageY });
    if (containerRef.current) setScrollStart({ left: containerRef.current.scrollLeft, top: containerRef.current.scrollTop });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPressed || !containerRef.current) return;
    const dx = e.pageX - dragStart.x;
    const dy = e.pageY - dragStart.y;
    if (!hasDraggedRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      setIsDragging(true);
      hasDraggedRef.current = true;
    }
    if (hasDraggedRef.current) {
      e.preventDefault();
      containerRef.current.scrollLeft = scrollStart.left - dx;
      containerRef.current.scrollTop = scrollStart.top - dy;
    }
  };

  const handleMouseUpOrLeave = () => { setIsPressed(false); setIsDragging(false); };
  
  // KHÔI PHỤC: Chặn click khi đang kéo cây
  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasDraggedRef.current = false;
    }
  };

  return (
    <div className="w-full h-full relative">
      <style dangerouslySetInnerHTML={{ __html: `
        .css-tree ul { padding-top: 20px; position: relative; display: flex; justify-content: center; transition: all 0.3s; }
        .css-tree li { float: left; text-align: center; list-style-type: none; position: relative; padding: 20px 2px 0 2px; }
        .css-tree li::before, .css-tree li::after { content: ''; position: absolute; top: 0; right: 50%; border-top: 2px solid #d6d3d1; width: 50%; height: 20px; }
        .css-tree li::after { right: auto; left: 50%; border-left: 2px solid #d6d3d1; }
        .css-tree li:only-child::after { display: none; }
        .css-tree li:only-child::before { content: ''; position: absolute; top: 0; left: 50%; border-left: 2px solid #d6d3d1; height: 20px; }
        .css-tree ul:first-child > li { padding-top: 0px; }
        .css-tree ul:first-child > li::before { display: none; }
        .css-tree li:first-child::before, .css-tree li:last-child::after { border: 0 none; }
        .css-tree li:last-child::before { border-right: 2px solid #d6d3d1; border-radius: 0 8px 0 0; }
        .css-tree li:first-child::after { border-radius: 8px 0 0 0; }
        .css-tree ul ul::before { content: ''; position: absolute; top: 0; left: 50%; border-left: 2px solid #d6d3d1; height: 20px; }
        .node-container { min-width: 100px; }
        .css-tree .flex.relative.z-10 { gap: 2px; }
      `}} />

      {/* PORTALS CHO ĐỘ SÂU */}
      {depthPortalNode && createPortal(
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md shadow-sm border border-stone-200/60 rounded-full px-3 h-10">
          <span className="text-sm font-semibold text-stone-600">Độ sâu:</span>
          <input 
            type="number" 
            min="0" 
            value={maxDepth === 0 ? "" : maxDepth} 
            onChange={(e) => setMaxDepth(e.target.value ? parseInt(e.target.value) : 0)} 
            className="w-10 bg-transparent text-sm font-medium text-amber-700 text-center focus:outline-none" 
            placeholder="∞" 
          />
        </div>, 
        depthPortalNode
      )}
      
      {/* PORTALS CHO TOOLBAR & FILTERS */}
      {portalNode && createPortal(
        <div className="flex flex-wrap justify-center items-center gap-2 w-max" ref={filtersRef}>
          <div className="flex items-center bg-white/80 backdrop-blur-md shadow-sm border border-stone-200/60 rounded-full h-10 overflow-hidden">
            <button onClick={handleZoomOut} className="px-3 h-full hover:bg-stone-100/50 text-stone-600"><ZoomOut className="size-4" /></button>
            <button onClick={handleResetZoom} className="px-2 h-full text-xs font-medium min-w-[50px] border-x border-stone-200/50">{Math.round(scale * 100)}%</button>
            <button onClick={handleZoomIn} className="px-3 h-full hover:bg-stone-100/50 text-stone-600"><ZoomIn className="size-4" /></button>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 h-10 rounded-full font-semibold text-sm border transition-all ${showFilters ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-white/80 text-stone-600 border-stone-200/60 backdrop-blur-md"}`}><Filter className="size-4" /> Lọc</button>
            
            <button onClick={exportSimpleHTML} disabled={isExportingHTML} className="flex items-center gap-2 px-4 h-10 rounded-full bg-white/80 text-stone-600 border border-stone-200/60 font-semibold text-sm shadow-sm hover:bg-white transition-all disabled:opacity-50">
              <Code className="size-4" /> {isExportingHTML ? "Đang xuất..." : "Xuất HTML"}
            </button>
            <ExportButton containerId="export-container" fileName="gia-pha-hinh-anh" />
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl shadow-xl border border-stone-200/60 rounded-2xl p-4 flex flex-col gap-3 z-50">
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer"><input type="checkbox" checked={!showAvatar} onChange={(e) => setShowAvatar(!e.target.checked)} className="rounded size-4" /> Ẩn ảnh chân dung</label>
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer"><input type="checkbox" checked={hideSpouses} onChange={(e) => setHideSpouses(e.target.checked)} className="rounded size-4" /> Ẩn dâu/rể</label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>, 
        portalNode
      )}

      <div 
        ref={containerRef} 
        className={`w-full h-full overflow-auto bg-stone-50 ${isPressed ? "cursor-grabbing" : "cursor-grab"}`} 
        onMouseDown={handleMouseDown} 
        onMouseMove={handleMouseMove} 
        onMouseUp={handleMouseUpOrLeave} 
        onMouseLeave={handleMouseUpOrLeave}
        onClickCapture={handleClickCapture}
      >
        <div id="export-container" className="w-max min-w-full mx-auto p-8 css-tree" style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
          <ul>{roots.map((root) => <React.Fragment key={root.id}>{renderTreeNode(root.id)}</React.Fragment>)}</ul>
        </div>
      </div>
    </div>
  );
}
