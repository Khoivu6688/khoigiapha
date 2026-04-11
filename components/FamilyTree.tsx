"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Person, Relationship } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Code, Filter, Image as ImageIcon, ZoomIn, ZoomOut, Plus, Minus } from "lucide-react";
import { useDashboard } from "./DashboardContext";
import ExportButton from "./ExportButton";
import FamilyNodeCard from "./FamilyNodeCard";
import { generateSimpleFamilyTreeHTML } from "@/utils/familyTreeUtils";

interface SpouseData {
  person: Person;
  note?: string | null;
}

// Hằng số đường nối
const LINE_W     = 2;
const LINE_COLOR = "#a8a29e";
const V_STEM     = 20; // đường dọc từ card cha xuống đường ngang
const V_DROP     = 20; // đường dọc từ đường ngang xuống card con
const H_GAP      = 8;  // khoảng cách ngang tối thiểu giữa các con

export default function FamilyTree({
  personsMap, relationships, roots, branches, canEdit,
}: {
  personsMap: Map<string, Person>;
  relationships: Relationship[];
  roots: Person[];
  branches: any[];
  canEdit?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed]     = useState(false);
  const [isDragging, setIsDragging]   = useState(false);
  const hasDraggedRef                 = useRef(false);
  const [dragStart, setDragStart]     = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });
  const [scale, setScale]             = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [hideSpouses, setHideSpouses] = useState(false);
  const [hideMales, setHideMales]     = useState(false);
  const [hideFemales, setHideFemales] = useState(false);
  const [maxDepth, setMaxDepth]       = useState<number>(0);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [isExportingHTML, setIsExportingHTML]   = useState(false);

  const { showAvatar, setShowAvatar, setRootId } = useDashboard();
  const filtersRef = useRef<HTMLDivElement>(null);
  const [portalNode, setPortalNode]           = useState<HTMLElement | null>(null);
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

  const handleZoomIn  = () => setScale(s => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.3));
  const handleReset   = () => setScale(1);

  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, [roots]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPressed(true); hasDraggedRef.current = false;
    setDragStart({ x: e.pageX, y: e.pageY });
    if (containerRef.current)
      setScrollStart({ left: containerRef.current.scrollLeft, top: containerRef.current.scrollTop });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPressed || !containerRef.current) return;
    const dx = e.pageX - dragStart.x, dy = e.pageY - dragStart.y;
    if (!hasDraggedRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      setIsDragging(true); hasDraggedRef.current = true;
    }
    if (hasDraggedRef.current) {
      e.preventDefault();
      containerRef.current.scrollLeft = scrollStart.left - dx;
      containerRef.current.scrollTop  = scrollStart.top  - dy;
    }
  };
  const handleMouseUpOrLeave = () => { setIsPressed(false); setIsDragging(false); };
  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) { e.stopPropagation(); e.preventDefault(); hasDraggedRef.current = false; }
  };

  const getTreeData = (personId: string) => {
    const spousesList: SpouseData[] = relationships
      .filter(r => r.type === "marriage" && (r.person_a === personId || r.person_b === personId))
      .map(r => ({ person: personsMap.get(r.person_a === personId ? r.person_b : r.person_a)!, note: r.note }))
      .filter(s => s.person)
      .filter(s => {
        if (hideSpouses) return false;
        if (hideMales   && s.person.gender === "male")   return false;
        if (hideFemales && s.person.gender === "female") return false;
        return true;
      });

    const childrenList = (
      relationships
        .filter(r => (r.type === "biological_child" || r.type === "adopted_child") && r.person_a === personId)
        .map(r => personsMap.get(r.person_b))
        .filter(Boolean) as Person[]
    )
      .filter(c => {
        if (hideMales   && c.gender === "male")   return false;
        if (hideFemales && c.gender === "female") return false;
        return true;
      })
      .sort((a, b) => {
        const ao = a.birth_order ?? Infinity, bo = b.birth_order ?? Infinity;
        if (ao !== bo) return ao - bo;
        return (a.birth_year ?? Infinity) - (b.birth_year ?? Infinity);
      });

    return { person: personsMap.get(personId)!, spouses: spousesList, children: childrenList };
  };

  const exportSimpleHTML = async () => {
    try {
      setIsExportingHTML(true);
      const treeData = roots.map(root => {
        const build = (pid: string, vis: Set<string> = new Set(), lv = 0): any => {
          if (vis.has(pid)) return null; vis.add(pid);
          const d = getTreeData(pid); if (!d.person) return null;
          const ok = maxDepth === 0 || lv < maxDepth - 1;
          return { person: d.person, spouses: d.spouses.map(s => s.person),
            children: (ok && !collapsedNodeIds.has(pid))
              ? d.children.map(c => build(c.id, new Set(vis), lv + 1)).filter(Boolean) : [], level: lv };
        }; return build(root.id);
      }).filter(Boolean);
      const html = generateSimpleFamilyTreeHTML(treeData, branches);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `giapha-tree-${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (err) { console.error(err); } finally { setIsExportingHTML(false); }
  };

  // ── Render node ─────────────────────────────────────────────────────────────
  //
  // Vấn đề khoảng trắng thừa:
  //   Mỗi nhánh cha căn giữa các con dưới mình → nhánh nhiều con chiếm rộng
  //   → tạo khoảng trắng lớn cạnh nhánh ít con ở cùng hàng
  //
  // Giải pháp: Mỗi node KHÔNG cố gắng căn giữa cha trên toàn bộ con.
  //   Thay vào đó, các con flex-row sát nhau (gap nhỏ),
  //   đường ngang nối anh/chị/em chỉ vẽ đúng phần từ con này sang con kế tiếp,
  //   dùng border-top CSS thay vì SVG để không phụ thuộc vào width thực tế.
  //
  // Kỹ thuật đường ngang:
  //   Mỗi child-slot có position: relative, height = V_DROP
  //   Bên trong là 2 absolute element:
  //     1. h-bar: border-top chạy từ [left] đến [right] (tùy là con đầu/giữa/cuối)
  //     2. v-drop: đường dọc ở giữa xuống card
  //   → Ghép lại tạo thành hình chữ T hoặc ┬ hoàn chỉnh, không đứt
  //
  const renderNode = (
    personId: string,
    visited:  Set<string> = new Set(),
    level    = 0,
    isFirst  = false,
    isLast   = false,
    isOnly   = false,
  ): React.ReactNode => {
    if (visited.has(personId)) return null;
    visited.add(personId);
    const data = getTreeData(personId);
    if (!data.person) return null;

    const hasChildren  = (maxDepth === 0 || level < maxDepth - 1) && data.children.length > 0;
    const isCollapsed  = collapsedNodeIds.has(personId);
    const showChildren = hasChildren && !isCollapsed;

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCollapsedNodeIds(prev => {
        const next = new Set(prev);
        next.has(personId) ? next.delete(personId) : next.add(personId);
        return next;
      });
    };

    return (
      <div
        key={personId}
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {/* ── Connector từ cha xuống (đường ngang + đường dọc vào card) ── */}
        {/* Chỉ render nếu có cha (level > 0), controlled bởi caller */}
        {/* Phần này được render BÊN TRONG caller ở children row */}

        {/* ── Card row ── */}
        <div
          className="relative flex items-center bg-white rounded-2xl shadow-md border border-stone-200/80 gap-0.5 p-0.5"
          style={{ zIndex: 10, flexShrink: 0 }}
        >
          <FamilyNodeCard person={data.person} onClickSetRoot={() => setRootId(data.person.id)} />
          {data.spouses.map((s, idx) => (
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

        {/* ── Đường dọc từ card xuống + hàng con ── */}
        {showChildren && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Đoạn dọc từ card xuống gặp đường ngang */}
            <div style={{ width: LINE_W, height: V_STEM, background: LINE_COLOR, flexShrink: 0 }} />

            {/* Hàng con — sát nhau, mỗi con tự vẽ connector của mình */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
              {data.children.map((child, idx) => {
                const n       = data.children.length;
                const _isOnly  = n === 1;
                const _isFirst = idx === 0;
                const _isLast  = idx === n - 1;

                return (
                  // Mỗi child-wrapper tự vẽ connector phía trên của mình
                  <div
                    key={child.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      // Thêm padding ngang để các card không dính vào nhau
                      paddingLeft:  _isFirst ? 0 : H_GAP / 2,
                      paddingRight: _isLast  ? 0 : H_GAP / 2,
                    }}
                  >
                    {/* Connector slot: đường ngang + đường dọc xuống */}
                    <div style={{ position: "relative", width: "100%", height: V_DROP, flexShrink: 0 }}>
                      {/* Đường ngang — chỉ vẽ phần cần thiết */}
                      {!_isOnly && (
                        <div style={{
                          position:  "absolute",
                          top:       0,
                          left:      _isFirst ? "50%" : 0,
                          right:     _isLast  ? "50%" : 0,
                          height:    LINE_W,
                          background: LINE_COLOR,
                        }} />
                      )}
                      {/* Đường dọc từ đường ngang xuống card */}
                      <div style={{
                        position:   "absolute",
                        top:        _isOnly ? 0 : 0,
                        left:       "50%",
                        transform:  "translateX(-50%)",
                        width:      LINE_W,
                        height:     V_DROP,
                        background: LINE_COLOR,
                      }} />
                    </div>

                    {/* Đệ quy render node con */}
                    {renderNode(child.id, new Set(visited), level + 1, _isFirst, _isLast, _isOnly)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (roots.length === 0)
    return <div className="text-center p-10 text-stone-500">Không tìm thấy dữ liệu.</div>;

  return (
    <div className="w-full h-full relative">
      {/* Depth portal */}
      {depthPortalNode && createPortal(
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md shadow-sm border border-stone-200/60 rounded-full px-3 h-10">
          <span className="text-sm font-semibold text-stone-600 hidden sm:inline">Độ sâu:</span>
          <input type="number" min="0" max="20"
            value={maxDepth === 0 ? "" : maxDepth}
            onChange={e => setMaxDepth(e.target.value ? parseInt(e.target.value) : 0)}
            className="w-10 bg-transparent text-sm font-medium text-amber-700 focus:outline-none text-center"
            placeholder="∞" title="Giới hạn đời (để trống = Không giới hạn)"
          />
        </div>,
        depthPortalNode,
      )}

      {/* Toolbar portal */}
      {portalNode && createPortal(
        <div className="flex flex-wrap justify-center items-center gap-2 w-max" ref={filtersRef}>
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

          <div className="relative">
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 h-10 rounded-full font-semibold text-sm shadow-sm border transition-all duration-300 ${
                showFilters
                  ? "bg-amber-100/90 text-amber-800 border-amber-200"
                  : "bg-white/80 text-stone-600 border-stone-200/60 hover:bg-white hover:text-stone-900 hover:shadow-md backdrop-blur-md"
              }`}>
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
                    <input type="checkbox" checked={!showAvatar} onChange={e => setShowAvatar(!e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4" />
                    <ImageIcon className="size-4 text-stone-400" /> Ẩn ảnh đại diện
                  </label>
                  <div className="h-px w-full bg-stone-100 my-1" />
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">LỌC DỮ LIỆU</div>
                  {[
                    { label: "Ẩn dâu/rể", state: hideSpouses, set: setHideSpouses },
                    { label: "Ẩn nam",     state: hideMales,   set: setHideMales   },
                    { label: "Ẩn nữ",      state: hideFemales, set: setHideFemales },
                  ].map(({ label, state, set }) => (
                    <label key={label} className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-stone-900 select-none">
                      <input type="checkbox" checked={state} onChange={e => set(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4" />
                      {label}
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={exportSimpleHTML} disabled={isExportingHTML}
            className="h-10 px-4 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/60 font-semibold text-sm flex items-center gap-2 text-stone-600 hover:bg-white hover:shadow-md transition-all disabled:opacity-50">
            <Code className="size-4" />
            <span className="hidden sm:inline">{isExportingHTML ? "Đang xuất..." : "HTML"}</span>
          </button>

          <ExportButton
            treeData={roots.map(root => {
              const build = (pid: string, vis: Set<string> = new Set(), lv = 0): any => {
                if (vis.has(pid)) return null; vis.add(pid);
                const d = getTreeData(pid); if (!d.person) return null;
                const ok = maxDepth === 0 || lv < maxDepth - 1;
                return { person: d.person, spouses: d.spouses.map(s => s.person),
                  children: (ok && !collapsedNodeIds.has(pid))
                    ? d.children.map(c => build(c.id, new Set(vis), lv + 1)).filter(Boolean) : [], level: lv };
              }; return build(root.id);
            }).filter(Boolean)}
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
        onDragStart={e => e.preventDefault()}
      >
        <div
          id="export-container"
          className={`w-max min-w-full mx-auto p-8 transition-all duration-200 ${isDragging ? "opacity-90" : ""}`}
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        >
          <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center" }}>
            {roots.map((root, idx) => {
              const n = roots.length;
              return (
                <div key={root.id} style={{
                  paddingLeft:  idx === 0     ? 0 : H_GAP / 2,
                  paddingRight: idx === n - 1 ? 0 : H_GAP / 2,
                }}>
                  {renderNode(root.id, new Set(), 0, idx === 0, idx === n - 1, n === 1)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
