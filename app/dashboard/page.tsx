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
  const { rootId } = await searchParams;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Lấy thông tin quyền hạn
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const canEdit = isAdmin || profile?.role === "editor";

  // 2. Fetch dữ liệu từ database
  const [
    { data: allPersons },
    { data: relsData },
    { data: branchesData }
  ] = await Promise.all([
    supabase.from("persons").select("*").order("birth_year", { ascending: true, nullsFirst: false }),
    supabase.from("relationships").select("*"),
    supabase.from("branches").select("*")
  ]);

  const persons = allPersons || [];
  const relationships = relsData || [];
  const branches = branchesData || [];

  // 3. Chuẩn bị Map để tra cứu nhanh (Yêu cầu bởi DashboardViews)
  const personsMap = new Map();
  persons.forEach((p) => personsMap.set(p.id, p));

  // 4. Xác định danh sách Roots (Yêu cầu bởi DashboardViews)
  // Root là người không phải là con của bất kỳ ai trong bảng quan hệ
  const childIds = new Set(
    relationships
      .filter((r) => r.type === "biological_child" || r.type === "adopted_child")
      .map((r) => r.person_b)
  );
  
  const roots = persons.filter((p) => !childIds.has(p.id));

  return (
    <DashboardProvider>
      <BranchProvider>
        <PrefixProvider>
          <div className="min-h-screen bg-stone-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col pt-4">
              {/* Truyền isAdmin vào ViewToggle để hiển thị nút Print A0 nếu cần */}
              <ViewToggle isAdmin={isAdmin} />
              
              <DashboardViews
                persons={persons}
                relationships={relationships}
                branches={branches}
                canEdit={canEdit}
                // CÁC PROPS BỔ SUNG ĐỂ SỬA LỖI BUILD:
                personsMap={personsMap}
                roots={roots}
                isAdmin={isAdmin}
                userEmail={user.email}
              />
            </div>
          </div>

          <MemberDetailModal />
        </PrefixProvider>
      </BranchProvider>
    </DashboardProvider>
  );
}
