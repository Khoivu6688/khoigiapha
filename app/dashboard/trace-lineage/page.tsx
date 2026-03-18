import { DashboardProvider } from "@/components/DashboardContext";
import MemberDetailModal from "@/components/MemberDetailModal";
import LineageTree from "@/components/LineageTree";
import { BranchProvider } from "@/components/BranchContext";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ personId?: string }>;
}

export default async function TraceLineagePage({ searchParams }: PageProps) {
  const { personId } = await searchParams;

  if (!personId) {
    redirect("/dashboard");
  }

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

  // Verify person exists
  const { data: person } = await supabase
    .from("persons")
    .select("id, full_name")
    .eq("id", personId)
    .single();

  if (!person) {
    redirect("/dashboard");
  }

  return (
    <DashboardProvider>
      <BranchProvider>
        <main className="flex-1 overflow-auto bg-stone-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <Link
                href="/dashboard"
                className="text-amber-600 hover:text-amber-700 font-medium mb-4 inline-block"
              >
                ← Quay lại Dashboard
              </Link>
              <h1 className="text-3xl font-serif font-bold text-stone-900 mt-2">
                Truy Vết Tổ Tiên
              </h1>
              <p className="text-stone-600 mt-2">
                Đang truy vết tổ tiên của: <span className="font-bold text-amber-700">{person.full_name}</span>
              </p>
            </div>

            <div className="bg-white/80 p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200/80">
              <LineageTree selectedPersonId={personId} />
            </div>
          </div>
        </main>
        <MemberDetailModal />
      </BranchProvider>
    </DashboardProvider>
  );
}
