import { DashboardProvider } from "@/components/DashboardContext";
import { BranchProvider } from "@/components/BranchContext";
import { PrefixProvider } from "@/components/PrefixContext";
import DashboardViews from "@/components/DashboardViews";
import MemberDetailModal from "@/components/MemberDetailModal";
import ViewToggle from "@/components/ViewToggle";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function FamilyTreePage({ searchParams }: { searchParams: Promise<{ rootId?: string }> }) {
  const { rootId } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";
  const canEdit = isAdmin || profile?.role === "editor";

  const [{ data: allPersons }, { data: relsData }, { data: branchesData }] = await Promise.all([
    supabase.from("persons").select("*").order("birth_year", { ascending: true }),
    supabase.from("relationships").select("*"),
    supabase.from("branches").select("*")
  ]);

  const persons = allPersons || [];
  const relationships = relsData || [];
  const branches = branchesData || [];

  const personsMap = new Map();
  persons.forEach((p) => personsMap.set(p.id, p));

  const childIds = new Set(relationships.filter((r) => r.type.includes("child")).map((r) => r.person_b));
  const roots = persons.filter((p) => !childIds.has(p.id));

  return (
    <DashboardProvider>
      <BranchProvider>
        <PrefixProvider>
          <div className="min-h-screen bg-stone-50/50">
            <div className="max-w-7xl mx-auto px-4 flex flex-col pt-4">
              <ViewToggle />
              <DashboardViews
                persons={persons}
                personsMap={personsMap}
                relationships={relationships}
                roots={roots}
                branches={branches}
                canEdit={canEdit}
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
