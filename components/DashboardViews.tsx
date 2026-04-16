"use client";
// ... (giữ nguyên các import)

export default function DashboardViews({
  persons,
  relationships,
  branches,
  canEdit = false,
}: DashboardViewsProps) {
  const { view: currentView, rootId } = useDashboard();
  // ... (giữ nguyên logic useMemo)

  const activeRootId = rootId || defaultRootId;

  return (
    <>
      {/* 1. Thêm overflow-x-hidden để chặn việc rung lắc màn hình ngang */}
      <main className="flex-1 bg-stone-50/50 flex flex-col w-full overflow-x-hidden">
        
        {/* VIEW: TREE & MINDMAP */}
        {(currentView === "tree" || currentView === "mindmap") &&
          persons.length > 0 &&
          activeRootId && (
            // Sửa px-4 thành px-2 trên mobile để lấy thêm diện tích
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-4 pb-2 w-full flex flex-col sm:flex-row flex-wrap items-center sm:justify-between gap-4 relative z-20">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto justify-center sm:justify-start">
                <RootSelector persons={persons} currentRootId={activeRootId} />
                <div id="tree-depth-portal" className="flex-shrink-0" />
              </div>
              <div
                id="tree-toolbar-portal"
                className="flex items-center gap-2 flex-wrap justify-center flex-shrink-0"
              />
            </div>
          )}

        {/* VIEW: LIST (Danh sách thành viên) 
            ĐÂY LÀ NƠI GÂY LỖI BÓP VIEW NHIỀU NHẤT
        */}
        {currentView === "list" && (
          // Thay px-4 bằng px-1 hoặc px-2 trên mobile
          <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-4 sm:py-8 w-full relative z-10 overflow-x-auto">
            <DashboardMemberList
              initialPersons={persons}
              canEdit={canEdit}
              totalCount={persons.length}
            />
          </div>
        )}

        {/* VIEW: LỌC CHI/ĐỜI */}
        {currentView === "members_filter" && (
          <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-4 sm:py-8 w-full relative z-10">
            <DashboardMembersBranchGenerationList persons={persons} />
          </div>
        )}

        {/* VIEW: CÀNH (BRANCHES) */}
        {currentView === "branches" && (
          // Thêm overflow-x-auto để bảng không bị bóp méo
          <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-4 w-full relative z-10 overflow-x-auto">
            <BranchesTable />
          </div>
        )}

        {/* VIEW: GIỚI THIỆU & DANH NHÂN */}
        {currentView === "introduction" && (
          <div className="relative w-full overflow-x-hidden">
            <Introduction />
          </div>
        )}

        {currentView === "notables" && (
          <div className="w-full px-2">
            <NotablesList persons={persons} />
          </div>
        )}

        {/* KHU VỰC HIỂN THỊ CÂY GIA PHẢ */}
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
