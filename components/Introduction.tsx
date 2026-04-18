"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // giữ theo project bạn
const supabase = createClient();

export default function Introduction() {
  // ================= STATE =================
  const [configId, setConfigId] = useState<number | string | null>(null);

  const [introduction, setIntroduction] = useState<string>("");
  const [draft, setDraft] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // ================= LOAD DATA =================
  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Check Admin
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setIsAdmin(profile?.role === "admin");
      }

      // 2. Load config
      const { data: configData, error: configError } = await supabase
        .from("config")
        .select("id, introduction")
        .limit(1)
        .single();

      if (configError) {
        console.error("Error loading config:", configError);
        setError("Không thể tải nội dung giới thiệu");
      } else if (configData) {
        setIntroduction(configData.introduction || "");
        setDraft(configData.introduction || "");
        setConfigId(configData.id);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // ================= SAVE =================
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
        .eq("id", configId);

      if (error) throw error;

      setIntroduction(draft);
      setIsEditing(false);
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving:", err);
      setError(err.message || "Không thể lưu nội dung");
    } finally {
      setSaving(false);
    }
  };

  // ================= INIT =================
  useEffect(() => {
    loadData();
  }, []);

  // ================= UI =================
  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Giới thiệu</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
          Lưu thành công!
        </div>
      )}

      {!isEditing ? (
        <div className="space-y-4">
          <p className="whitespace-pre-line">
            {introduction || "Chưa có nội dung"}
          </p>

          {isAdmin && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Chỉnh sửa
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full border p-3 rounded min-h-[150px]"
          />

          <div className="flex gap-2">
            <button
              onClick={saveIntroduction}
              disabled={saving}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>

            <button
              onClick={() => {
                setIsEditing(false);
                setDraft(introduction);
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
