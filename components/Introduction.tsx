// ... các import giữ nguyên

export default function Introduction() {
  // Thêm một state để lưu ID thực tế từ database
  const [configId, setConfigId] = useState<number | string | null>(null);
  
  // ... các state khác giữ nguyên

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Kiểm tra Admin (Giữ nguyên logic của bạn)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setIsAdmin(profile?.role === "admin");
      }

      // 2. Lấy dữ liệu và LƯU LẠI ID
      const { data: configData, error: configError } = await supabase
        .from("config")
        .select("id, introduction") // Lấy thêm ID ở đây
        .limit(1)
        .single();

      if (configError) {
        console.error("Error loading config:", configError);
        setError("Không thể tải nội dung giới thiệu");
      } else if (configData) {
        setIntroduction(configData.introduction);
        setDraft(configData.introduction || "");
        setConfigId(configData.id); // Lưu ID vào state
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const saveIntroduction = async () => {
    if (!configId) {
      setError("Không tìm thấy ID cấu hình để cập nhật");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from("config")
        .update({ introduction: draft })
        .eq("id", configId); // Sử dụng ID động thay vì số 1 cứng nhắc

      if (error) throw error;

      setIntroduction(draft);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving:", err);
      // Hiển thị lỗi chi tiết từ Supabase để dễ debug
      setError(err.message || "Không thể lưu nội dung");
    } finally {
      setSaving(false);
    }
  };

  // ... phần return giữ nguyên
}
