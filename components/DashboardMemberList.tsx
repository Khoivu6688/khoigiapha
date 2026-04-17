"use client";

import PersonCard from "@/components/PersonCard";
import { Person } from "@/types";
import { ArrowUpDown, Filter, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function DashboardMemberList({
  initialPersons,
  canEdit = false,
  totalCount: propTotalCount,
}: {
  initialPersons: Person[];
  canEdit?: boolean;
  totalCount?: number;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("updated_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [filterOption, setFilterOption] = useState("all");

  const filteredPersons = initialPersons.filter((person) => {
    const matchesSearch = person.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    switch (filterOption) {
      case "male": matchesFilter = person.gender === "male"; break;
      case "female": matchesFilter = person.gender === "female"; break;
      case "in_law_female": matchesFilter = person.gender === "female" && person.is_in_law; break;
      case "in_law_male": matchesFilter = person.gender === "male" && person.is_in_law; break;
      case "deceased": matchesFilter = person.is_deceased; break;
      default: matchesFilter = true; break;
    }
    return matchesSearch && matchesFilter;
  });

  const sortedPersons = [...filteredPersons].sort((a, b) => {
    switch (sortOption) {
      case "name_asc": return a.full_name.localeCompare(b.full_name);
      case "birth_asc": return (a.birth_year || 0) - (b.birth_year || 0);
      case "birth_desc": return (b.birth_year || 0) - (a.birth_year || 0);
      default: return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
    }
  });

  const totalPages = Math.ceil(sortedPersons.length / pageSize);
  const paginatedPersons = sortedPersons.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterOption]);

  return (
    <div className="max-w-6xl mx-auto w-full -mt-8">
      <div className="mb-6">
        {/* Thanh công cụ chính */}
        <div className="flex flex-col md:flex-row items-center gap-2 bg-white/70 backdrop-blur-md p-1.5 rounded-xl border border-stone-200/60 shadow-sm transition-all">
          
          {/* 1. Ô Tìm kiếm: Co giãn linh hoạt */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm thành viên..."
              className="w-full h-10 pl-9 pr-3 bg-white/50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Nhóm các nút chức năng cố định 120px */}
          <div className="flex flex-row gap-2 items-center w-full md:w-auto">
            
            {/* 2. Thẻ Lọc: Fix 120px */}
            <div className="relative w-[120px] flex-shrink-0">
              <Filter className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-stone-400 pointer-events-none" />
              <select
                className="appearance-none w-full h-10 pl-7 pr-6 bg-white/50 border border-stone-200 rounded-lg text-[11px] font-bold text-stone-700 cursor-pointer focus:outline-none focus:border-amber-400 transition-all uppercase tracking-tight"
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="deceased">Đã mất</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <ArrowUpDown className="size-3 text-stone-300" />
              </div>
            </div>

            {/* 3. Thẻ Sắp xếp: Fix 120px */}
            <div className="relative w-[120px] flex-shrink-0">
              <ArrowUpDown className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-stone-400 pointer-events-none" />
              <select
                className="appearance-none w-full h-10 pl-7 pr-6 bg-white/50 border border-stone-200 rounded-lg text-[11px] font-bold text-stone-700 cursor-pointer focus:outline-none focus:border-amber-400 transition-all uppercase tracking-tight"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="updated_desc">Mới nhất</option>
                <option value="birth_asc">Năm sinh ↑</option>
                <option value="name_asc">Tên A-Z</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <ArrowUpDown className="size-3 text-stone-300" />
              </div>
            </div>

            {/* 4. Nút Thêm mới: Fix 120px */}
            {canEdit && (
              <Link 
                href="/dashboard/members/new" 
                className="flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white w-[120px] h-10 rounded-lg text-[11px] font-bold transition-all shadow-sm active:scale-95 uppercase tracking-tight flex-shrink-0"
              >
                <Plus className="size-3.5" strokeWidth={3} />
                Thêm mới
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grid danh sách */}
      {paginatedPersons.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedPersons.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-stone-400 text-sm italic border-2 border-dashed border-stone-200 rounded-2xl">
          Không tìm thấy thành viên nào phù hợp.
        </div>
      )}

      {/* Phân trang tinh gọn */}
      <div className="mt-10 flex flex-col items-center gap-4 mb-12">
        {sortedPersons.length > pageSize && (
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
              disabled={currentPage === 1}
              className="px-4 py-1.5 text-xs font-bold border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-30 transition-all"
            >
              Trở lại
            </button>
            <div className="px-4 text-xs font-bold text-stone-500">
              Trang {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
              disabled={currentPage === totalPages}
              className="px-4 py-1.5 text-xs font-bold border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-30 transition-all"
            >
              Tiếp theo
            </button>
          </div>
        )}
        <div className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-black">
          Hệ thống ghi nhận: {sortedPersons.length} thành viên
        </div>
      </div>
    </div>
  );
}
