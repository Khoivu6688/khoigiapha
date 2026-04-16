"use client";

import { useDashboard } from "@/components/DashboardContext";
import DashboardMemberList from "@/components/DashboardMemberList";
import DashboardMembersBranchGenerationList from "@/components/DashboardMembersBranchGenerationList";
import FamilyTree from "@/components/FamilyTree";
import MindmapTree from "@/components/MindmapTree";
import RootSelector from "@/components/RootSelector";
// BỎ: BranchesTable và NotablesList vì không còn dùng trong menu
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
      {/* SỬA LỖI MOBILE: min-w-0 để ngăn khung bị đẩy rộng hơn màn hình */}
      <main className="flex-1 bg-stone-50/50 flex flex-col w-full min-w-0">
        
        {(currentView === "tree" || currentView === "mindmap") &&
          persons.length > 0 &&
          activeRootId && (
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-6 pb-2 w-full flex flex-col sm:flex-row flex-wrap items-center sm:justify-between gap-4 relative z-20">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap w-full sm:w-auto justify-center sm:justify-start">
                <RootSelector persons={persons} currentRootId={activeRootId} />
                <div id="tree-depth-portal" />
              </div>
              <div
                id="tree-toolbar-portal"
                className="flex items-center gap-2 flex-wrap justify-center"
              />
            </div>
          )}

        {currentView === "list" && (
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8 w-full relative z-10 overflow-x-hidden">
            <DashboardMemberList
              initialPersons={persons}
              canEdit={canEdit}
              totalCount={persons.length}
            />
          </div>
        )}

        {currentView === "members_filter" && (
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8 w-full relative z-10">
            <DashboardMembersBranchGenerationList persons={persons} />
          </div>
        )}

        {/* ĐÃ XÓA: Mục Branches (Các chi) hoàn toàn khỏi logic render */}

        {currentView === "introduction" && (
          <div className="relative">
            <Introduction />
          </div>
        )}

        {/* ĐÃ XÓA: Mục Notables (Danh nhân) hoàn toàn khỏi logic render */}

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
