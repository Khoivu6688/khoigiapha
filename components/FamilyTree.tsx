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

// ─── Hằng số đường nối — chỉnh 1 chỗ là thay đổi toàn bộ ────────────────────
const LINE_W = 2;             // độ dày đường (px)
const LINE_COLOR = "#a8a29e"; // stone-400 — đậm hơn bản gốc
const V_GAP = 32;             // khoảng dọc giữa card cha và hàng con (px)
const H_GAP = 12;             // khoảng ngang giữa các con (px)

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

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.3));
  const handleResetZoom = () => setScale(1);

  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, [roots]);

  // ─── Drag ─────────────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPressed(true);
    hasDraggedRef.current = false;
    setDragStart({ x: e.pageX, y: e.pageY });
    if (containerRef.current) {
      setScrollStart({
        left: containerRef.current.scrollLeft,
        top: containerRef.current.scrollTop,
      });
    }
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

  const handleMouseUpOrLeave = () => {
    setIsPressed(false);
    setIsDragging(false);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasDraggedRef.current = false;
    }
  };

  // ─── Data helpers ─────────────────────────────────────────────────────────
  const getTreeData = (personId: string) => {
    const spousesList: SpouseData[] = relationships
      .filter(
        (r) =>
          r.type === "marriage" &&
          (r.person_a === personId || r.person_b === personId),
      )
      .map((r) => {
        const spouseId = r.person_a === personId ? r.person_b : r.person_a;
        return { person: personsMap.get(spouseId)!, note: r.note };
      })
      .filter((s) => s.person)
      .filter((s) => {
        if (hideSpouses) return false;
        if (hideMales && s.person.gender === "male") return false;
        if (hideFemales && s.person.gender === "female") return false;
        return true;
      });

    const childrenList = (
      relationships
        .filter(
          (r) =>
            (r.type === "biological_child" || r.type === "adopted_child") &&
            r.person_a === personId,
        )
        .map((r) => personsMap.get(r.person_b))
        .filter(Boolean) as Person[]
    )
      .filter((c) => {
        if (hideMales && c.gender === "male") return false;
        if (hideFemales && c.gender === "female") return false;
        return true;
      })
      .sort((a, b) => {
        const aOrder = a.birth_order ?? Infinity;
        const bOrder = b.birth_order ?? Infinity;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return (a.birth_year ?? Infinity) - (b.birth_year ?? Infinity);
      });

    return {
      person: personsMap.get(personId)!,
      spouses: spousesList,
      children: childrenList,
    };
  };

  // ─── Export ───────────────────────────────────────────────────────────────
  const exportSimpleHTML = async () => {
    try {
      setIsExportingHTML(true);
      const treeData = roots
        .map((root) => {
          const buildNode = (
            personId: string,
            visited: Set<string> = new Set(),
            level = 0,
          ): any => {
            if (visited.has(personId)) return null;
            visited.add(personId);
            const data = getTreeData(personId);
            if (!data.person) return null;
            const isCollapsed = collapsedNodeIds.has(personId);
            const shouldInclude = maxDepth === 0 || level < maxDepth - 1;
            return {
              person: data.person,
              spouses: data.spouses.map((s) => s.person),
              children:
                shouldInclude && !isCollapsed
                  ? data.children
                      .map((c) => buildNode(c.id, new Set(visited), level + 1))
                      .filter(Boolean)
                  : [],
              level,
            };
          };
          return buildNode(root.id);
        })
        .filter(Boolean);
      const htmlContent = generateSimpleFamilyTreeHTML(treeData, branches);
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `giapha-tree-${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export HTML error:", err);
    } finally {
      setIsExportingHTML(false);
    }
  };

  // ─── Render tree node ─────────────────────────────────────────────────────
  //
  // Sơ đồ đường nối (nhìn từ trên xuống):
  //
  //         ┌──────────────┐
  //         │  Card cha    │   ← z-index: 10
  //         └──────┬───────┘
  //                │  ← đường dọc cao V_GAP/2 (nửa trên)
  //         ───────┼───────    ← đường ngang SVG, y = V_GAP/2
  //         │      │      │   ← đường dọc cao V_GAP/2 (nửa dưới) cho mỗi con
  //       [con1] [con2] [con3]
  //
  // Kỹ thuật SVG:
  //   - SVG absolute, width=100%, height=V_GAP, overflow=visible
  //   - vectorEffect="non-scaling-stroke" để lineW luôn = px thật dù SVG scale
  //   - Tọa độ X dùng % để tự động căn giữa mỗi con bất kể width khác nhau
  //
  const renderTreeNode = (
    personId: string,
    visited: Set<string> = new Set(),
    level = 0,
  ): React.ReactNode => {
    if (visited.has(personId)) return null;
    visited.add(personId);

    const data = getTreeData(personId);
    if (!data.person) return null;

    const hasChildren =
      (maxDepth === 0 || level < maxDepth - 1) && data.children.length > 0;
    const isCollapsed = collapsedNodeIds.has(personId);
    const showChildren = hasChildren && !isCollapsed;
    const childCount = data.children.length;

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCollapsedNodeIds((prev) => {
        const next = new Set(prev);
        next.has(personId) ? next.delete(personId) : next.add(personId);
        return next;
      });
    };

    return (
      <div key={personId} className="flex flex-col items-center">

        {/* Card row */}
        <div
          className="relative flex items-center bg-white rounded-2xl shadow-md border border-stone-200/80 gap-0.5 p-0.5"
          style={{ zIndex: 10 }}
        >
          <FamilyNodeCard
            person={data.person}
            onClickSetRoot={() => setRootId(data.person.id)}
          />
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
              onClick={handleToggle}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full size-6 flex items-center justify-center shadow-md cursor-pointer text-stone-400 hover:text-amber-600 transition-colors"
              style={{ zIndex: 20, border: `${LINE_W}px solid ${LINE_COLOR}` }}
            >
              {isCollapsed ? <Plus className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            </div>
          )}
        </div>

        {/* Đường dọc từ card xuống + hàng con */}
        {showChildren && (
          <>
            {/* Đoạn dọc từ card xuống gặp đường ngang (nửa trên V_GAP) */}
            <div
              style={{
                width: LINE_W,
                height: V_GAP / 2,
                background: LINE_COLOR,
                flexShrink: 0,
              }}
            />

            {/* Wrapper chứa SVG đường nối + hàng con */}
            <div
              className="relative flex flex-row items-start"
              style={{ gap: H_GAP }}
            >
              {/*
                SVG vẽ:
                - Đường ngang (y = V_GAP/2) từ center con đầu → center con cuối
                - Đường dọc (nửa dưới) xuống mỗi con

                Dùng SVG thay CSS để:
                1. Đường KHÔNG đứt — liên tục pixel-perfect
                2. vectorEffect="non-scaling-stroke" giữ độ dày đúng khi zoom
                3. Tọa độ % tự động căn giữa bất kể width node khác nhau
              */}
              <svg
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: V_GAP / 2,
                  overflow: "visible",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              >
                {childCount === 1 ? (
                  // 1 con: chỉ đường dọc thẳng
                  <line
                    x1="50%"
                    y1="0"
                    x2="50%"
                    y2={`${V_GAP / 2}`}
                    stroke={LINE_COLOR}
                    strokeWidth={LINE_W}
                    vectorEffect="non-scaling-stroke"
                  />
                ) : (
                  <>
                    {/* Đường ngang nối trung tâm con đầu → con cuối */}
                    <line
                      x1={`${(0.5 / childCount) * 100}%`}
                      y1="0"
                      x2={`${((childCount - 0.5) / childCount) * 100}%`}
                      y2="0"
                      stroke={LINE_COLOR}
                      strokeWidth={LINE_W}
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* Đường dọc xuống từng con */}
                    {Array.from({ length: childCount }).map((_, i) => (
                      <line
                        key={i}
                        x1={`${((i + 0.5) / childCount) * 100}%`}
                        y1="0"
                        x2={`${((i + 0.5) / childCount) * 100}%`}
                        y2={`${V_GAP / 2}`}
                        stroke={LINE_COLOR}
                        strokeWidth={LINE_W}
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                  </>
                )}
              </svg>

              {/* Hàng con — mỗi con thêm paddingTop để tránh overlap SVG */}
              {data.children.map((child) => (
                <div
                  key={child.id}
                  className="flex flex-col items-center"
                  style={{ paddingTop: V_GAP / 2 }}
                >
                  {renderTreeNode(child.id, new Set(visited), level + 1)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (roots.length === 0)
    return (
      <div className="text-center p-10 text-stone-500">
        Không tìm thấy dữ liệu.
      </div>
    );

  return (
    <div className="w-full h-full relative">
      {/* Depth portal */}
      {depthPortalNode &&
        createPortal(
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md shadow-sm border border-stone-200/60 rounded-full px-3 h-10">
            <span className="text-sm font-semibold text-stone-600 hidden sm:inline">
              Độ sâu:
            </span>
            <input
              type="number"
              min="0"
              max="20"
              value={maxDepth === 0 ? "" : maxDepth}
              onChange={(e) =>
                setMaxDepth(e.target.value ? parseInt(e.target.value) : 0)
              }
              className="w-10 bg-transparent text-sm font-medium text-amber-700 focus:outline-none text-center"
              placeholder="∞"
              title="Giới hạn đời (để trống = Không giới hạn)"
            />
          </div>,
          depthPortalNode,
        )}

      {/* Toolbar portal */}
      {portalNode &&
        createPortal(
          <div
            className="flex flex-wrap justify-center items-center gap-2 w-max"
            ref={filtersRef}
          >
            {/* Zoom */}
            <div className="flex items-center bg-white/80 backdrop-blur-md shadow-sm border border-stone-200/60 rounded-full overflow-hidden h-10">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.3}
                className="px-3 h-full hover:bg-stone-100/50 text-stone-600 transition-colors disabled:opacity-50"
                title="Thu nhỏ"
              >
                <ZoomOut className="size-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 h-full hover:bg-stone-100/50 text-stone-600 text-xs font-medium min-w-[50px] text-center border-x border-stone-200/50"
                title="Đặt lại"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 2}
                className="px-3 h-full hover:bg-stone-100/50 text-stone-600 transition-colors disabled:opacity-50"
                title="Phóng to"
              >
                <ZoomIn className="size-4" />
              </button>
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 h-10 rounded-full font-semibold text-sm shadow-sm border transition-all duration-300 ${
                  showFilters
                    ? "bg-amber-100/90 text-amber-800 border-amber-200"
                    : "bg-white/80 text-stone-600 border-stone-200/60 hover:bg-white hover:text-stone-900 hover:shadow-md backdrop-blur-md"
                }`}
              >
                <Filter className="size-4" />
                <span className="hidden sm:inline">Lọc hiển thị</span>
              </button>
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl shadow-xl border border-stone-200/60 rounded-2xl p-4 flex flex-col gap-3 z-50"
                  >
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                      HIỂN THỊ
                    </div>
                    <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-stone-900 transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={!showAvatar}
                        onChange={(e) => setShowAvatar(!e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
                      />
                      <ImageIcon className="size-4 text-stone-400" /> Ẩn ảnh đại diện
                    </label>
                    <div className="h-px w-full bg-stone-100 my-1" />
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                      LỌC DỮ LIỆU
                    </div>
                    <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-stone-900 select-none">
                      <input
                        type="checkbox"
                        checked={hideSpouses}
                        onChange={(e) => setHideSpouses(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
                      />
                      Ẩn dâu/rể
                    </label>
                    <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-stone-900 select-none">
                      <input
                        type="checkbox"
                        checked={hideMales}
                        onChange={(e) => setHideMales(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
                      />
                      Ẩn nam
                    </label>
                    <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-stone-900 select-none">
                      <input
                        type="checkbox"
                        checked={hideFemales}
                        onChange={(e) => setHideFemales(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
                      />
                      Ẩn nữ
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export HTML */}
            <button
              onClick={exportSimpleHTML}
              disabled={isExportingHTML}
              className="h-10 px-4 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/60 font-semibold text-sm flex items-center gap-2 text-stone-600 hover:bg-white hover:shadow-md transition-all disabled:opacity-50"
            >
              <Code className="size-4" />
              <span className="hidden sm:inline">
                {isExportingHTML ? "Đang xuất..." : "HTML"}
              </span>
            </button>

            {/* Export image */}
            <ExportButton
              treeData={roots
                .map((root) => {
                  const buildNode = (
                    personId: string,
                    visited: Set<string> = new Set(),
                    level = 0,
                  ): any => {
                    if (visited.has(personId)) return null;
                    visited.add(personId);
                    const data = getTreeData(personId);
                    if (!data.person) return null;
                    const isCollapsed = collapsedNodeIds.has(personId);
                    const shouldInclude = maxDepth === 0 || level < maxDepth - 1;
                    return {
                      person: data.person,
                      spouses: data.spouses.map((s) => s.person),
                      children:
                        shouldInclude && !isCollapsed
                          ? data.children
                              .map((c) =>
                                buildNode(c.id, new Set(visited), level + 1),
                              )
                              .filter(Boolean)
                          : [],
                      level,
                    };
                  };
                  return buildNode(root.id);
                })
                .filter(Boolean)}
              branches={branches}
            />
          </div>,
          portalNode,
        )}

      {/* Main canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full overflow-auto bg-stone-50 ${isPressed ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          id="export-container"
          className={`w-max min-w-full mx-auto p-8 transition-all duration-200 ${isDragging ? "opacity-90" : ""}`}
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        >
          <div className="flex flex-row items-start justify-center gap-8">
            {roots.map((root) => (
              <React.Fragment key={root.id}>
                {renderTreeNode(root.id)}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
