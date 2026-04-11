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
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (containerRef.current && roots.length > 0) {
      const el = containerRef.current;
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, [roots]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.3));
  const handleResetZoom = () => setScale(1);

  // TÍNH NĂNG XUẤT FILE GỐC
  const exportSimpleHTML = async () => {
    try {
      setIsExportingHTML(true);
      const treeData = roots.map((root) => {
        const buildNode = (pId: string, vis: Set<string> = new Set(), lvl: number = 0): any => {
          if (vis.has(pId)) return null;
          vis.add(pId);
          const data = getTreeData(pId);
          if (!data.person) return null;
          const isCollapsed = collapsedNodeIds.has(pId);
          const shouldIncludeChildren = maxDepth === 0 || lvl < maxDepth - 1;
          const children = (shouldIncludeChildren && !isCollapsed)
            ? data.children.map((c) => buildNode(c.id, new Set(vis), lvl + 1)).filter(Boolean)
            : [];
          return { person: data.person, spouses: data.spouses.map((s) => s.person), children, level: lvl };
        };
        return buildNode(root.id);
      }).filter(Boolean);

      const htmlContent = generateSimpleFamilyTreeHTML(treeData, branches);
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `giapha-vuba-${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Lỗi xuất HTML:", err);
    } finally {
      setIsExportingHTML(false);
    }
  };

  const getTreeData = (personId: string) => {
    const spousesList: SpouseData[] = relationships
      .filter((r) => r.type === "marriage" && (r.person_a === personId || r.person_b === personId))
      .map((r) => {
        const spouseId = r.person_a === personId ? r.person_b : r.person_a;
        const p = personsMap.get(spouseId);
        return p ? { person: p, note: r.note } : null;
      })
      .filter((s): s is SpouseData => {
        if (!s || !s.person || hideSpouses) return false;
        if (hideMales && s.person.gender === "male") return false;
        if (hideFemales && s.person.gender === "female") return false;
        return true;
      });

    const childrenList = (relationships
      .filter((r) => (r.type === "biological_child" || r.type === "adopted_child") && r.person_a === personId)
      .map((r) => personsMap.get(r.person_b))
      .filter(Boolean) as Person[])
      .filter((c) => {
        if (hideMales && c.gender === "male") return false;
        if (hideFemales && c.gender === "female") return false;
        return true;
      })
      .sort((a, b) => {
        // Ưu tiên sắp xếp theo birth_order (6, 7, 8...), nếu null thì xuống cuối
        const aOrder = a.birth_order ?? Infinity;
        const bOrder = b.birth_order ?? Infinity;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return (a.birth_year ?? Infinity) - (b.birth_year ?? Infinity);
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
      <li key={personId}>
        <div className="node-container inline-flex flex-col items-center">
          <div className="flex relative z-10 bg-white rounded-2xl shadow-md border border-stone-200/80 items-stretch">
            <FamilyNodeCard person={data.person} onClickSetRoot={() => setRootId(data.person.id)} />
            {data.spouses.map((spouseData, idx) => (
              <FamilyNodeCard 
                key={spouseData.person.id} 
                isRingVisible={idx === 0} 
                isPlusVisible={idx > 0}
                person={spouseData.person} 
                role={spouseData.person.gender === "male" ? "Chồng" : "Vợ"} 
                note={spouseData.note} 
                onClickSetRoot={() => setRootId(spouseData.person.id)} 
              />
            ))}
            {hasChildren && (
              <div 
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-stone-200/80 rounded-full size-6 flex items-center justify-center shadow-md z-20 cursor-pointer text-stone-500 hover:text-amber-600 transition-colors" 
                onClick={(e) => { e.stopPropagation(); setCollapsedNodeIds(prev => { const n = new Set(prev); n.has(personId) ? n.delete(personId) : n.add(personId); return n; }); }}
              >
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

  return (
    <div className="w-full h-full relative">
      <style dangerouslySetInnerHTML={{ __html: `
        .css-tree ul { padding-top: 25px; position: relative; display: flex; justify-content: center; }
        .css-tree li { float: left; text-align: center; list-style-type: none; position: relative; padding: 25px 4px 0 4px; }
        .css-tree li::before, .css-tree li::after { content: ''; position: absolute; top: 0; right: 50%; border-top: 2px solid #d6d3d1; width: 50%; height: 25px; }
        .css-tree li::after { right: auto; left: 50%; border-left: 2px solid #d6d3d1; }
        .css-tree li:only-child::after { display: none; }
        .css-tree li:only-child::before { content: ''; position: absolute; top: 0; left: 50%; border-left: 2px solid #d6d3d1; height: 25px; width: 0; }
        .css-tree ul:first-child > li { padding-top: 0px; }
        .css-tree ul:first-child > li::before { display: none; }
        .css-tree li:first-child::before, .css-tree li:last-child::after { border: 0 none; }
        .css-tree li:last-child::before { border-right: 2px solid #d6d3d1; border-radius: 0 10px 0 0; }
        .css-tree li:first-child::after { border-radius: 10px 0 0 0; }
        .css-tree ul ul::before { content: ''; position: absolute; top: 0; left: 50%; border-left: 2px solid #d6d3d1; height: 25px; width: 0; }
        .node-container { min-width: 120px; }
      `}} />

      {depthPortalNode && createPortal(
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md shadow-sm border border-stone-200/60 rounded-full px-3 h-10">
          <span className="text-sm font-semibold text-stone-600">Đời:</span>
          <input type="number" min="0" value={maxDepth === 0 ? "" : maxDepth} onChange={(e) => setMaxDepth(e.target.value ? parseInt(e.target.value) : 0)} className="w-8 bg-transparent text-sm font-medium text-amber-700 text-center focus:outline-none" placeholder="∞" />
        </div>, depthPortalNode
      )}

      {portalNode && createPortal(
        <div className="flex flex-wrap justify-center items-center gap-2 w-max" ref={filtersRef}>
          <div className="flex items-center bg-white/80 backdrop-blur-md shadow-sm border border-stone-200/60 rounded-full h-10 overflow-hidden">
            <button onClick={handleZoomOut} className="px-3 h-full hover:bg-stone-100/50 text-stone-600"><ZoomOut className="size-4" /></button>
            <button onClick={handleResetZoom} className="px-2 h-full text-xs font-medium min-w-[50px] border-x border-stone-200/50">{Math.round(scale * 100)}%</button>
            <button onClick={handleZoomIn} className="px-3 h-full hover:bg-stone-100/50 text-stone-600"><ZoomIn className="size-4" /></button>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 h-10 rounded-full font-semibold text-sm border transition-all ${showFilters ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-white/80 text-stone-600 border-stone-200/60"}`}><Filter className="size-4" /> Lọc</button>
          
          <div className="flex items-center gap-2">
            <button onClick={exportSimpleHTML} disabled={isExportingHTML} className="flex items-center gap-2 px-4 h-10 rounded-full bg-white/80 text-stone-600 border border-stone-200/60 font-semibold text-sm shadow-sm hover:bg-white transition-all">
              <Code className="size-4" /> {isExportingHTML ? "..." : "Xuất HTML"}
            </button>
            <ExportButton treeData={roots.map(r => r.id)} branches={branches} />
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl shadow-xl border border-stone-200/60 rounded-2xl p-4 flex flex-col gap-3 z-50">
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer"><input type="checkbox" checked={!showAvatar} onChange={(e) => setShowAvatar(!e.target.checked)} className="rounded size-4" /> Ẩn chân dung</label>
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer"><input type="checkbox" checked={hideSpouses} onChange={(e) => setHideSpouses(e.target.checked)} className="rounded size-4" /> Ẩn dâu/rể</label>
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer"><input type="checkbox" checked={hideMales} onChange={(e) => setHideMales(e.target.checked)} className="rounded size-4" /> Ẩn Nam</label>
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer"><input type="checkbox" checked={hideFemales} onChange={(e) => setHideFemales(e.target.checked)} className="rounded size-4" /> Ẩn Nữ</label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>, portalNode
      )}

      <div 
        ref={containerRef} 
        className={`w-full h-full overflow-auto bg-stone-50 ${isPressed ? "cursor-grabbing" : "cursor-grab"}`} 
        onMouseDown={handleMouseDown} 
        onMouseMove={handleMouseMove} 
        onMouseUp={() => setIsPressed(false)} 
        onMouseLeave={() => setIsPressed(false)}
      >
        <div id="export-container" className="w-max min-w-full mx-auto p-8 css-tree" style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
          <ul>{roots.map((root) => <React.Fragment key={root.id}>{renderTreeNode(root.id)}</React.Fragment>)}</ul>
        </div>
      </div>
    </div>
  );
}
