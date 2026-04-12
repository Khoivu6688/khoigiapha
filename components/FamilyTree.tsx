"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Person, Relationship } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Code, Filter, Image as ImageIcon,
  ZoomIn, ZoomOut, Plus, Minus,
} from "lucide-react";
import { useDashboard } from "./DashboardContext";
import ExportButton from "./ExportButton";
import FamilyNodeCard from "./FamilyNodeCard";
import { generateSimpleFamilyTreeHTML } from "@/utils/familyTreeUtils";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SpouseData { person: Person; note?: string | null }

// ─── Hằng số ─────────────────────────────────────────────────────────────────
const LINE_W      = 2;
const LINE_COLOR  = "#a8a29e";
const NODE_GAP    = 32;   // khoảng cách ngang giữa các card
const V_STEM      = 24;   // đường dọc từ card cha xuống điểm nối ngang
const V_DROP      = 24;   // đường dọc từ điểm nối ngang xuống card con

// ─── TreeNode: cấu trúc dữ liệu cây ─────────────────────────────────────────
interface TreeNode {
  personId:  string;
  person:    Person;
  spouses:   SpouseData[];
  children:  TreeNode[];
  width:     number;  // tổng width của subtree (tính sau)
  x:         number;  // vị trí center tuyệt đối (tính sau)
  y:         number;  // vị trí top tuyệt đối (tính sau)
}

// ─── Component chính ─────────────────────────────────────────────────────────
export default function FamilyTree({
  personsMap, relationships, roots, branches, canEdit,
}: {
  personsMap:    Map<string, Person>;
  relationships: Relationship[];
  roots:         Person[];
  branches:      any[];
  canEdit?:      boolean;
}) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLDivElement>(null);

  // drag state
  const isPressed      = useRef(false);
  const hasDragged     = useRef(false);
  const dragStart      = useRef({ x: 0, y: 0 });
  const scrollStart    = useRef({ left: 0, top: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // zoom & filters
  const [scale,        setScale]        = useState(1);
  const [showFilters,  setShowFilters]  = useState(false);
  const [hideSpouses,  setHideSpouses]  = useState(false);
  const [hideMales,    setHideMales]    = useState(false);
  const [hideFemales,  setHideFemales]  = useState(false);
  const [maxDepth,     setMaxDepth]     = useState(0);
  const [collapsed,    setCollapsed]    = useState<Set<string>>(new Set());
  const [isExporting,  setIsExporting]  = useState(false);

  // node size cache: personId → {w, h}
  const [nodeSizes, setNodeSizes] = useState<Map<string, { w: number; h: number }>>(new Map());
  const sizeObservers = useRef<Map<string, ResizeObserver>>(new Map());

  const { showAvatar, setShowAvatar, setRootId } = useDashboard();
  const filtersRef    = useRef<HTMLDivElement>(null);
  const [portalNode,      setPortalNode]      = useState<HTMLElement | null>(null);
  const [depthPortalNode, setDepthPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalNode(document.getElementById("tree-toolbar-portal"));
    setDepthPortalNode(document.getElementById("tree-depth-portal"));
    const onOutside = (e: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node))
        setShowFilters(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // ── Scroll to center on load ──────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (containerRef.current) {
        const el = containerRef.current;
        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
        el.scrollTop  = 0;
      }
    }, 150);
    return () => clearTimeout(t);
  }, [roots, nodeSizes]);

  // ── Zoom ─────────────────────────────────────────────────────────────────
  const handleZoomIn  = () => setScale(s => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.3));
  const handleReset   = () => setScale(1);

  // ── Drag ─────────────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    isPressed.current  = true;
    hasDragged.current = false;
    dragStart.current  = { x: e.pageX, y: e.pageY };
    if (containerRef.current)
      scrollStart.current = {
        left: containerRef.current.scrollLeft,
        top:  containerRef.current.scrollTop,
      };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPressed.current || !containerRef.current) return;
    const dx = e.pageX - dragStart.current.x;
    const dy = e.pageY - dragStart.current.y;
    if (!hasDragged.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      hasDragged.current = true;
      setIsDragging(true);
    }
    if (hasDragged.current) {
      e.preventDefault();
      containerRef.current.scrollLeft = scrollStart.current.left - dx;
      containerRef.current.scrollTop  = scrollStart.current.top  - dy;
    }
  };
  const onMouseUp = () => { isPressed.current = false; setIsDragging(false); };
  const onClickCapture = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.stopPropagation(); e.preventDefault();
      hasDragged.current = false;
    }
  };

  // ── Lấy dữ liệu 1 node ───────────────────────────────────────────────────
  const getNodeData = useCallback((personId: string) => {
    const person = personsMap.get(personId);
    if (!person) return null;

    const spouses: SpouseData[] = relationships
      .filter(r => r.type === "marriage" &&
        (r.person_a === personId || r.person_b === personId))
      .map(r => ({
        person: personsMap.get(
          r.person_a === personId ? r.person_b : r.person_a
        )!,
        note: r.note,
      }))
      .filter(s => s.person)
      .filter(s => {
        if (hideSpouses) return false;
        if (hideMales   && s.person.gender === "male")   return false;
        if (hideFemales && s.person.gender === "female") return false;
        return true;
      });

    const children = relationships
      .filter(r =>
        (r.type === "biological_child" || r.type === "adopted_child") &&
        r.person_a === personId
      )
      .map(r => personsMap.get(r.person_b))
      .filter(Boolean)
      .filter((c: any) => {
        if (hideMales   && c.gender === "male")   return false;
        if (hideFemales && c.gender === "female") return false;
        return true;
      })
      .sort((a: any, b: any) => {
        const ao = a.birth_order ?? Infinity;
        const bo = b.birth_order ?? Infinity;
        if (ao !== bo) return ao - bo;
        return (a.birth_year ?? Infinity) - (b.birth_year ?? Infinity);
      }) as Person[];

    return { person, spouses, children };
  }, [personsMap, relationships, hideSpouses, hideMales, hideFemales]);

  // ── Đăng ký ResizeObserver cho 1 node element ────────────────────────────
  const registerNodeRef = useCallback((personId: string, el: HTMLDivElement | null) => {
    // Cleanup cũ
    if (sizeObservers.current.has(personId)) {
      sizeObservers.current.get(personId)!.disconnect();
      sizeObservers.current.delete(personId);
    }
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      setNodeSizes(prev => {
        const cur = prev.get(personId);
        if (cur && Math.abs(cur.w - w) < 1 && Math.abs(cur.h - h) < 1) return prev;
        const next = new Map(prev);
        next.set(personId, { w, h });
        return next;
      });
    });
    ro.observe(el);
    sizeObservers.current.set(personId, ro);
  }, []);

  useEffect(() => {
    return () => {
      sizeObservers.current.forEach(ro => ro.disconnect());
    };
  }, []);

  // ── NODE_W: chiều rộng 1 card row (person + spouses) ─────────────────────
  const getCardRowWidth = useCallback((personId: string, spouses: SpouseData[]) => {
    const sz = nodeSizes.get(personId);
    // fallback nếu chưa đo được
    if (!sz) return 160 + spouses.length * 100;
    let w = sz.w;
    spouses.forEach(s => {
      const ssz = nodeSizes.get(s.person.id);
      w += (ssz?.w ?? 100) + 4; // 4 = gap-0.5 * 2 (p-0.5)
    });
    return w;
  }, [nodeSizes]);

  // ── Render 1 node đệ quy ─────────────────────────────────────────────────
  const renderNode = useCallback((
    personId: string,
    visited:  Set<string>,
    level:    number,
  ): React.ReactNode => {
    if (visited.has(personId)) return null;
    const data = getNodeData(personId);
    if (!data) return null;
    visited.add(personId);

    const { person, spouses, children } = data;
    const isCollapsed   = collapsed.has(personId);
    const depthOk       = maxDepth === 0 || level < maxDepth - 1;
    const hasChildren   = depthOk && children.length > 0;
    const showChildren  = hasChildren && !isCollapsed;

    const toggleCollapse = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCollapsed(prev => {
        const next = new Set(prev);
        next.has(personId) ? next.delete(personId) : next.add(personId);
        return next;
      });
    };

    // Chiều rộng card row để tính connector
    const cardW = getCardRowWidth(personId, spouses);

    // Width của từng subtree con
    const childWidths = showChildren
      ? children.map(c => {
          const cData = getNodeData(c.id);
          if (!cData) return getCardRowWidth(c.id, []);
          // Ước tính width subtree: dùng card width của con (đơn giản)
          // Trong thực tế cần đệ quy — dùng nodeSizes làm proxy
          return getCardRowWidth(c.id, cData.spouses);
        })
      : [];

    // Tổng width hàng con (có NODE_GAP giữa)
    const totalChildrenW = childWidths.reduce((s, w) => s + w, 0) +
      Math.max(0, childWidths.length - 1) * NODE_GAP;

    return (
      <div
        key={personId}
        style={{
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          // Chiều rộng tối thiểu = max(cardRow, tổng con)
          minWidth:      Math.max(cardW, totalChildrenW),
        }}
      >
        {/* ── Card row ── */}
        <div
          ref={el => registerNodeRef(personId, el)}
          className="relative flex items-center bg-white rounded-2xl shadow-md border border-stone-200/80 gap-0.5 p-0.5"
          style={{ zIndex: 10, flexShrink: 0 }}
        >
          <FamilyNodeCard
            person={person}
            onClickSetRoot={() => setRootId(person.id)}
          />
          {spouses.map((s, idx) => (
            <FamilyNodeCard
              key={s.person.id}
              isRingVisible={idx === 0}
              isPlusVisible={idx > 0}
              person={s.person}
              role={s.person.gender === "male" ? "Chồng" : "Vợ"}
              note={s.note}
              onClickSetRoot={() => setRootId(s.person.id)}
            />
          ))}

          {/* Toggle collapse button */}
          {hasChildren && (
            <div
              onClick={toggleCollapse}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full size-6 flex items-center justify-center shadow-md cursor-pointer text-stone-400 hover:text-amber-600 transition-colors"
              style={{ zIndex: 20, border: `${LINE_W}px solid ${LINE_COLOR}` }}
            >
              {isCollapsed
                ? <Plus  className="w-3.5 h-3.5" />
                : <Minus className="w-3.5 h-3.5" />
              }
            </div>
          )}
        </div>

        {/* ── Connector + children ── */}
        {showChildren && children.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

            {/* Đường dọc từ card xuống điểm nối ngang */}
            <div style={{
              width:      LINE_W,
              height:     V_STEM,
              background: LINE_COLOR,
              flexShrink: 0,
            }} />

            {/* SVG đường ngang + dọc xuống từng con */}
            {children.length === 1 ? (
              // 1 con: chỉ đường dọc thẳng
              <div style={{
                width:      LINE_W,
                height:     V_DROP,
                background: LINE_COLOR,
                flexShrink: 0,
              }} />
            ) : (
              // Nhiều con: đường ngang + từng nhánh dọc
              <div
                style={{
                  position: "relative",
                  width:    "100%",
                  height:   V_DROP,
                  flexShrink: 0,
                }}
              >
                {/* SVG vẽ đường ngang từ giữa con đầu đến giữa con cuối */}
                <svg
                  style={{
                    position: "absolute",
                    top:      0,
                    left:     0,
                    width:    "100%",
                    height:   "100%",
                    overflow: "visible",
                  }}
                >
                  {(() => {
                    // Tính vị trí center X của từng con
                    const centers: number[] = [];
                    let cursor = 0;
                    childWidths.forEach((cw, i) => {
                      centers.push(cursor + cw / 2);
                      cursor += cw + (i < childWidths.length - 1 ? NODE_GAP : 0);
                    });
                    const totalW = cursor;
                    const offsetX = (100 - totalW) / 2; // offset để căn giữa nếu totalW < 100%

                    if (centers.length < 2) return null;
                    const x1 = centers[0];
                    const x2 = centers[centers.length - 1];

                    return (
                      <g>
                        {/* Đường ngang */}
                        <line
                          x1={x1} y1={LINE_W / 2}
                          x2={x2} y2={LINE_W / 2}
                          stroke={LINE_COLOR}
                          strokeWidth={LINE_W}
                        />
                        {/* Đường dọc xuống mỗi con */}
                        {centers.map((cx, i) => (
                          <line
                            key={i}
                            x1={cx} y1={LINE_W / 2}
                            x2={cx} y2={V_DROP}
                            stroke={LINE_COLOR}
                            strokeWidth={LINE_W}
                          />
                        ))}
                      </g>
                    );
                  })()}
                </svg>
              </div>
            )}

            {/* Hàng con */}
            <div style={{
              display:        "flex",
              flexDirection:  "row",
              alignItems:     "flex-start",
              justifyContent: "center",
              gap:            NODE_GAP,
              width:          "100%",
            }}>
              {children.map((child, idx) => {
                if (visited.has(child.id)) return null;
                return (
                  <div key={child.id} style={{ flexShrink: 0 }}>
                    {renderNode(child.id, new Set(visited), level + 1)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }, [
    getNodeData, getCardRowWidth, registerNodeRef,
    collapsed, maxDepth, nodeSizes,
    setRootId,
  ]);

  // ── Export HTML ───────────────────────────────────────────────────────────
  const exportSimpleHTML = async () => {
    try {
      setIsExporting(true);
      const build = (pid: string, vis: Set<string> = new Set(), lv = 0): any => {
        if (vis.has(pid)) return null;
        const d = getNodeData(pid);
        if (!d) return null;
        vis.add(pid);
        const ok = maxDepth === 0 || lv < maxDepth - 1;
        return {
          person:   d.person,
          spouses:  d.spouses.map(s => s.person),
          children: (ok && !collapsed.has(pid))
            ? d.children.map(c => build(c.id, new Set(vis), lv + 1)).filter(Boolean)
            : [],
          level: lv,
        };
      };
      const treeData = roots.map(r => build(r.id)).filter(Boolean);
      const html     = generateSimpleFamilyTreeHTML(treeData, branches);
      const blob     = new Blob([html], { type: "text/html;charset=utf-8" });
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement("a");
      a.href         = url;
      a.download     = `giapha-tree-${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  if (roots.length === 0)
    return <div className="text-center p-10 text-stone-500">Không tìm thấy dữ liệu.</div>;

  return (
    <div className="w-full h-full relative">

      {/* ── Depth portal ── */}
      {depthPortalNode && createPortal(
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md shadow-sm border border-stone-200/60 rounded-full px-3 h-10">
          <span className="text-sm font-semibold text-stone-600 hidden sm:inline">Độ sâu:</span>
          <input
            type="number" min="0" max="20"
            value={maxDepth === 0 ? "" : maxDepth}
            onChange={e => setMaxDepth(e.target.value ? parseInt(e.target.value) : 0)}
            className="w-10 bg-transparent text-sm font-medium text-amber-700 focus:outline-none text-center"
            placeholder="∞"
            title="Giới hạn đời (để trống = không giới hạn)"
          />
        </div>,
        depthPortalNode,
      )}

      {/* ── Toolbar portal ── */}
      {portalNode && createPortal(
        <div className="flex flex-wrap justify-center items-center gap-2 w-max" ref={filtersRef}>

          {/* Zoom controls */}
          <div className="flex items-center bg-white/80 backdrop-blur-md shadow-sm border border-stone-200/60 rounded-full overflow-hidden h-10">
            <button onClick={handleZoomOut} disabled={scale <= 0.3} title="Thu nhỏ"
              className="px-3 h-full hover:bg-stone-100/50 text-stone-600 transition-colors disabled:opacity-50">
              <ZoomOut className="size-4" />
            </button>
            <button onClick={handleReset} title="Đặt lại"
              className="px-2 h-full hover:bg-stone-100/50 text-stone-600 text-xs font-medium min-w-[50px] text-center border-x border-stone-200/50">
              {Math.round(scale * 100)}%
            </button>
            <button onClick={handleZoomIn} disabled={scale >= 2} title="Phóng to"
              className="px-3 h-full hover:bg-stone-100/50 text-stone-600 transition-colors disabled:opacity-50">
              <ZoomIn className="size-4" />
            </button>
          </div>

          {/* Filters */}
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
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">HIỂN THỊ</div>
                  <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-stone-900 select-none">
                    <input
                      type="checkbox" checked={!showAvatar}
                      onChange={e => setShowAvatar(!e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
                    />
                    <ImageIcon className="size-4 text-stone-400" /> Ẩn ảnh đại diện
                  </label>
                  <div className="h-px w-full bg-stone-100 my-1" />
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">LỌC DỮ LIỆU</div>
                  {[
                    { label: "Ẩn dâu/rể",  state: hideSpouses, set: setHideSpouses },
                    { label: "Ẩn nam",      state: hideMales,   set: setHideMales   },
                    { label: "Ẩn nữ",       state: hideFemales, set: setHideFemales },
                  ].map(({ label, state, set }) => (
                    <label key={label} className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-stone-900 select-none">
                      <input
                        type="checkbox" checked={state}
                        onChange={e => set(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
                      />
                      {label}
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export HTML */}
          <button
            onClick={exportSimpleHTML}
            disabled={isExporting}
            className="h-10 px-4 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/60 font-semibold text-sm flex items-center gap-2 text-stone-600 hover:bg-white hover:shadow-md transition-all disabled:opacity-50"
          >
            <Code className="size-4" />
            <span className="hidden sm:inline">{isExporting ? "Đang xuất..." : "HTML"}</span>
          </button>

          {/* Export button */}
          <ExportButton
            treeData={roots.map(root => {
              const build = (pid: string, vis: Set<string> = new Set(), lv = 0): any => {
                if (vis.has(pid)) return null;
                const d = getNodeData(pid);
                if (!d) return null;
                vis.add(pid);
                const ok = maxDepth === 0 || lv < maxDepth - 1;
                return {
                  person:   d.person,
                  spouses:  d.spouses.map(s => s.person),
                  children: (ok && !collapsed.has(pid))
                    ? d.children.map(c => build(c.id, new Set(vis), lv + 1)).filter(Boolean)
                    : [],
                  level: lv,
                };
              };
              return build(root.id);
            }).filter(Boolean)}
            branches={branches}
          />
        </div>,
        portalNode,
      )}

      {/* ── Main canvas ── */}
      <div
        ref={containerRef}
        className={`w-full h-full overflow-auto bg-stone-50 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClickCapture={onClickCapture}
        onDragStart={e => e.preventDefault()}
      >
        <div
          ref={canvasRef}
          id="export-container"
          className={`w-max min-w-full mx-auto p-8 transition-all duration-200 ${isDragging ? "opacity-90" : ""}`}
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        >
          {/* Hàng roots */}
          <div style={{
            display:        "flex",
            flexDirection:  "row",
            alignItems:     "flex-start",
            justifyContent: "center",
            gap:            NODE_GAP,
          }}>
            {roots.map(root => (
              <div key={root.id} style={{ flexShrink: 0 }}>
                {renderNode(root.id, new Set(), 0)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
