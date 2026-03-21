"use client";

import { useDashboard } from "@/components/DashboardContext";
import DashboardMemberList from "@/components/DashboardMemberList";
import DashboardMembersBranchGenerationList from "@/components/DashboardMembersBranchGenerationList";
import FamilyTree from "@/components/FamilyTree";
import MindmapTree from "@/components/MindmapTree";
import RootSelector from "@/components/RootSelector";
import BranchesTable from "@/components/BranchesTable";
import Introduction from "@/components/Introduction";
import NotablesList from "@/components/NotablesList";
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

  // Prepare map and roots for tree views
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

    // If no rootId is provided, fallback to the earliest created person
    if (!finalRootId || !pMap.has(finalRootId)) {
      const rootsFallback = persons.filter((p) => !childIds.has(p.id));
      if (rootsFallback.length > 0) {
        finalRootId = rootsFallback[0].id;
      } else if (persons.length > 0) {
        finalRootId = persons[0].id; // ultimate fallback
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
      <main className="flex-1 bg-stone-50/50 flex flex-col">
        {(currentView === "tree" || currentView === "mindmap") &&
          persons.length > 0 &&
          activeRootId && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 w-full flex flex-col sm:flex-row flex-wrap items-center sm:justify-between gap-4 relative z-20">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
            <DashboardMemberList
              initialPersons={persons}
              canEdit={canEdit}
              totalCount={persons.length}
            />
          </div>
        )}

        {currentView === "members_filter" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
            <DashboardMembersBranchGenerationList persons={persons} />
          </div>
        )}

        {currentView === "branches" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
            <BranchesTable />
          </div>
        )}

        {currentView === "introduction" && (
          <div className="relative">
            <Introduction />
          </div>
        )}

        {currentView === "notables" && <NotablesList persons={persons} />}

        <div className="flex-1 w-full relative z-10">
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
