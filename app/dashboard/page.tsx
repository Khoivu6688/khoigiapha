import { DashboardProvider } from "@/components/DashboardContext";
import { BranchProvider } from "@/components/BranchContext";
import { PrefixProvider } from "@/components/PrefixContext";
import DashboardViews from "@/components/DashboardViews";
import MemberDetailModal from "@/components/MemberDetailModal";
import ViewToggle from "@/components/ViewToggle";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ view?: string; rootId?: string }>;
}

export default async function FamilyTreePage({ searchParams }: PageProps) {
  const { rootId, view = "list" } = await searchParams;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const canEdit = profile?.role === "admin" || profile?.role === "editor";
  const isAdmin = profile?.role === "admin"; // Biến mới để check quyền cấu hình in

  // Fetch dữ liệu
  const [{ data: allPersons }, { data: relsData }, { data: branchesData }] = await Promise.all([
    supabase.from("persons").select("*").order("birth_year", { ascending: true, nullsFirst: false }),
    supabase.from("relationships").select("*"),
    supabase.from("branches").select("*")
  ]);

  const persons = allPersons || [];
  const relationships = relsData || [];
  const branches = branchesData || [];

  // --- LOGIC CŨ CỦA BẠN: CHUẨN BỊ MAP VÀ ROOTS ---
  const personsMap = new Map();
  persons.forEach((p) => personsMap.set(p.id, p));

  const childIds = new Set(
    relationships
      .filter((r) => r.type === "biological_child" || r.type === "adopted_child")
      .map((r) => r.person_b)
  );

  // Tìm toàn bộ danh sách Roots (Dùng cho in A0 và fallback)
  const roots = persons.filter((p) => !childIds.has(p.id));

  return (
    <DashboardProvider>
      <BranchProvider>
        <PrefixProvider>
          <div className="min-h-screen bg-stone-50/50">
            {/* ViewToggle và nội dung cũ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
              <ViewToggle />
              <DashboardViews
                persons={persons}
                personsMap={personsMap} // Truyền thêm cho logic cũ
                relationships={relationships}
                roots={roots}           // Truyền thêm cho logic cũ
                branches={branches}
                canEdit={canEdit}
                isAdmin={isAdmin}       // Truyền thêm cho tính năng in
                userEmail={user.email}  // Truyền thêm cho HeaderMenu
              />
            </div>
          </div>
          <MemberDetailModal />
        </PrefixProvider>
      </BranchProvider>
    </DashboardProvider>
  );
}
