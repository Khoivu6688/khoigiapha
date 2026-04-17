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

  // If view is list, we only need persons, not relationships.
  // We fetch persons for all views to pass down as a prop if we want, or let components fetch.
  // For list view, we implement pagination to avoid loading too many members
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  // For list view, implement pagination
  const pageSize = 50; // 50 members per page
  const page = 1; // Get from search params later

  let personsData = [];
  let relationships = [];
  let branches = [];

  // Always fetch all persons for search/filter to work properly
  const { data: allPersons } = await supabase
    .from("persons")
    .select("*")
    .order("birth_year", { ascending: true, nullsFirst: false });

  const { data: relsData } = await supabase.from("relationships").select("*");
  const { data: branchesData } = await supabase.from("branches").select("*");

  personsData = allPersons || [];
  relationships = relsData || [];
  branches = branchesData || [];

  const persons = personsData;

  // Prepare map and roots for tree views
  const personsMap = new Map();
  persons.forEach((p) => personsMap.set(p.id, p));

  const childIds = new Set(
    relationships
      .filter(
        (r) => r.type === "biological_child" || r.type === "adopted_child",
      )
      .map((r) => r.person_b),
  );

  let finalRootId = rootId;

  // If no rootId is provided, fallback to the earliest created person
  if (!finalRootId || !personsMap.has(finalRootId)) {
    const rootsFallback = persons.filter((p) => !childIds.has(p.id));
    if (rootsFallback.length > 0) {
      finalRootId = rootsFallback[0].id;
    } else if (persons.length > 0) {
      finalRootId = persons[0].id; // ultimate fallback
    }
  }

  return (
    <DashboardProvider>
      <BranchProvider>
        <PrefixProvider>
          <div className="min-h-screen bg-stone-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
              <ViewToggle />
              <DashboardViews
                persons={persons}
                relationships={relationships}
                branches={branches}
                canEdit={canEdit}
              />
            </div>
          </div>

          <MemberDetailModal />
        </PrefixProvider>
      </BranchProvider>
    </DashboardProvider>
  );
}
