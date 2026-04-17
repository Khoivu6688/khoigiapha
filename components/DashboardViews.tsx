"use client";

import { useDashboard } from "@/components/DashboardContext";
import DashboardMemberList from "@/components/DashboardMemberList";
import DashboardMembersBranchGenerationList from "@/components/DashboardMembersBranchGenerationList";
import FamilyTree from "@/components/FamilyTree";
import MindmapTree from "@/components/MindmapTree";
import RootSelector from "@/components/RootSelector";
import Introduction from "@/components/Introduction";
import { Person, Relationship } from "@/types";
import { useMemo } from "react";

interface DashboardViewsProps {
  persons: Person[];
  relationships: Relationship[];
  branches: any[];
  canEdit?: boolean;
}

export default function DashboardViews({
  persons,
  relationships,
  branches,
  canEdit = false,
}: DashboardViewsProps) {
  const { view: currentView, rootId } = useDashboard();

  // Logic tính toán cây gia phả và gốc (Root)
  const { personsMap, roots, defaultRootId } = useMemo(() => {
    const pMap = new Map<string, Person>();
    persons.forEach((p) => pMap.set(p.id, p));

    const childIds = new Set(
      relationships
        .filter(
          (r) => r.type === "biological_child" || r.type === "adopted_child",
        )
        .map((r) => r.person_b),
    );

    let finalRootId = rootId;

    if (!finalRootId || !pMap.has(finalRootId)) {
      const rootsFallback = persons.filter((p) => !childIds.has(p.id));
      if (rootsFallback.length > 0) {
        finalRootId = rootsFallback[0].id;
      } else if (persons.length > 0) {
        finalRootId = persons[0].id; 
      }
    }

    let calculatedRoots: Person[] = [];
    if (finalRootId && pMap.has(finalRootId)) {
      calculatedRoots = [pMap.get(finalRootId)!];
    }

    return {
      personsMap: pMap,
      roots: calculatedRoots,
      defaultRootId: finalRootId,
    };
  }, [persons, relationships, rootId]);

  const activeRootId = rootId || defaultRootId;

  return (
    <>
      {/* - min-w-0: Ngăn chặn lỗi flexbox đẩy chiều rộng main vượt quá màn hình mobile.
          - bg-stone-50/50: Tạo nền nhẹ nhàng cho Dashboard.
      */}
      <main className="flex-1 bg-stone-50/50 flex flex-col w-full min-w-0 overflow-hidden">
        
        {/* KHỐI ĐIỀU KHIỂN CÂY (Chỉ hiện khi xem Sơ đồ/Mindmap) */}
        {(currentView === "tree" || currentView === "mindmap") &&
          persons.length > 0 &&
          activeRootId && (
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-4 pb-2 w-full flex flex-col sm:flex-row flex-wrap items-center sm:justify-between gap-2 relative z-20">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto justify-center sm:justify-start">
                <RootSelector persons={persons} currentRootId={activeRootId} />
                <div id="tree-depth-portal" />
              </div>
              <div
                id="tree-toolbar-portal"
                className="flex items-center gap-2 flex-wrap justify-center"
              />
            </div>
          )}

        {/* VIEW: DANH SÁCH THÀNH VIÊN */}
        {currentView === "list" && (
          <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-2 sm:py-6 w-full relative z-10 overflow-x-hidden">
            <DashboardMemberList
              initialPersons={persons}
              canEdit={canEdit}
              totalCount={persons.length}
            />
          </div>
        )}

        {/* VIEW: LỌC THEO CHI/ĐỜI */}
        {currentView === "members_filter" && (
          <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-2 sm:py-6 w-full relative z-10">
            <DashboardMembersBranchGenerationList persons={persons} />
          </div>
        )}

        {/* VIEW: GIỚI THIỆU DÒNG HỌ */}
        {currentView === "introduction" && (
          <div className="relative pt-2 sm:pt-4">
            <Introduction />
          </div>
        )}

        {/* VIEW: SƠ ĐỒ GIA PHẢ & MINDMAP (Chiếm toàn bộ diện tích còn lại) */}
        <div className="flex-1 w-full relative z-10 overflow-hidden">
          {currentView === "tree" && (
            <FamilyTree
              personsMap={personsMap}
              relationships={relationships}
              branches={branches}
              roots={roots}
              canEdit={canEdit}
            />
          )}
          {currentView === "mindmap" && (
            <MindmapTree
              personsMap={personsMap}
              relationships={relationships}
              branches={branches}
              roots={roots}
              canEdit={canEdit}
            />
          )}
        </div>
      </main>
    </>
  );
}
