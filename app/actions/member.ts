"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function deleteMemberProfile(memberId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Kiểm tra xác thực & Quyền hạn
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vui lòng đăng nhập." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "editor") {
    return {
      error: "Từ chối truy cập. Chỉ Admin hoặc Editor mới có quyền xoá hồ sơ.",
    };
  }

  // 2. Kiểm tra mối quan hệ (Để tránh làm gãy cây gia phả)
  const { data: relationships, error: relationshipError } = await supabase
    .from("relationships")
    .select("id")
    .or(`person_a.eq.${memberId},person_b.eq.${memberId}`)
    .limit(1);

  if (relationshipError) {
    console.error("Error checking relationships:", relationshipError);
    return { error: "Lỗi kiểm tra mối quan hệ gia đình." };
  }

  if (relationships && relationships.length > 0) {
    return {
      error:
        "Không thể xoá. Vui lòng xoá hết các mối quan hệ gia đình của người này trước để tránh lỗi cây gia phả.",
    };
  }

  try {
    // 3. Xóa dữ liệu ở các bảng phụ TRƯỚC (Để tránh lỗi Foreign Key Constraint)
    // Bước này đảm bảo bảng person_details_private sạch sẽ trước khi xóa bảng chính
    const { error: privateError } = await supabase
      .from("person_details_private")
      .delete()
      .eq("person_id", memberId);

    if (privateError) {
      console.error("Error deleting private details:", privateError);
      return { error: "Không thể xóa dữ liệu chi tiết cá nhân." };
    }

    // 4. Xóa bản ghi gốc ở bảng persons
    const { error: deleteError } = await supabase
      .from("persons")
      .delete()
      .eq("id", memberId);

    if (deleteError) {
      console.error("Error deleting person:", deleteError);
      return { error: "Đã xảy ra lỗi khi xoá bản ghi gốc." };
    }

    // 5. Làm mới bộ nhớ đệm và điều hướng
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/members");
    
    // Sử dụng success để client handle việc redirect sẽ mượt hơn 
    // hoặc giữ nguyên redirect nếu bạn muốn chuyển trang ngay lập tức
    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "Lỗi hệ thống không xác định." };
  }
}
