// Trong file page.tsx
return (
  <DashboardProvider>
    <BranchProvider>
      <PrefixProvider>
        <div className="min-h-screen bg-stone-50/50">
          <div className="max-w-7xl mx-auto px-4 flex flex-col pt-4">
            {/* TRUYỀN THÊM isAdmin VÀO ĐÂY */}
            <ViewToggle isAdmin={isAdmin} /> 
            
            <DashboardViews
              persons={persons}
              personsMap={personsMap}
              relationships={relationships}
              roots={roots}
              branches={branches}
              canEdit={canEdit}
              isAdmin={isAdmin}
            />
          </div>
        </div>
        <MemberDetailModal />
      </PrefixProvider>
    </BranchProvider>
  </DashboardProvider>
);
