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
    <div className="max-w-6xl mx-auto w-full -mt-2"> {/* Đã hạ thấp xuống bằng cách đổi từ -mt-8 thành -mt-2 */}
      <div className="mb-6">
        {/* Container chính: Trên mobile sẽ dàn hàng dọc nhẹ nhàng, các nút ngang sẽ có scroll nếu tràn */}
        <div className="flex flex-col lg:flex-row items-center gap-3 bg-white/75 backdrop-blur-md p-2 rounded-xl border border-stone-200/60 shadow-sm">
          
          {/* 1. Ô Tìm kiếm: Chiếm toàn bộ không gian còn lại */}
          <div className="relative w-full flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm tên thành viên..."
              className="w-full h-10 pl-9 pr-3 bg-white/50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Nhóm các nút chức năng: Ép ngang trên mọi thiết bị để không bị kéo cao khung */}
          <div className="flex flex-row gap-2 items-center w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0 flex-nowrap">
            
            {/* 2. Thẻ Lọc: Fix 140px */}
            <div className="relative w-[140px] flex-shrink-0">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400 pointer-events-none" />
              <select
                className="appearance-none w-full h-10 pl-8 pr-7 bg-white/60 border border-stone-200 rounded-lg text-[11px] font-bold text-stone-700 cursor-pointer focus:outline-none focus:border-amber-400 uppercase tracking-tighter"
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
              >
                <option value="all">TẤT CẢ</option>
                <option value="male">NAM</option>
                <option value="female">NỮ</option>
                <option value="deceased">ĐÃ MẤT</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-stone-300 pointer-events-none" />
            </div>

            {/* 3. Thẻ Sắp xếp: Fix 140px */}
            <div className="relative w-[140px] flex-shrink-0">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400 pointer-events-none" />
              <select
                className="appearance-none w-full h-10 pl-8 pr-7 bg-white/60 border border-stone-200 rounded-lg text-[11px] font-bold text-stone-700 cursor-pointer focus:outline-none focus:border-amber-400 uppercase tracking-tighter"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="updated_desc">MỚI NHẤT</option>
                <option value="birth_asc">NĂM SINH ↑</option>
                <option value="name_asc">TÊN A-Z</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-stone-300 pointer-events-none" />
            </div>

            {/* 4. Nút Thêm mới: Fix 160px */}
            {canEdit && (
              <Link 
                href="/dashboard/members/new" 
                className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white w-[160px] h-10 rounded-lg text-[11px] font-bold transition-all shadow-sm flex-shrink-0 uppercase"
              >
                <Plus className="size-3.5" strokeWidth={3} />
                Thêm thành viên
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
        <div className="text-center py-12 text-stone-400 text-sm italic border-2 border-dashed border-stone-100 rounded-2xl">
          Không tìm thấy kết quả phù hợp.
        </div>
      )}

      {/* Phân trang */}
      <div className="mt-8 flex flex-col items-center gap-4 mb-10">
        {sortedPersons.length > pageSize && (
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
              disabled={currentPage === 1}
              className="px-4 py-1.5 text-xs font-bold border border-stone-200 rounded-lg disabled:opacity-30 bg-white"
            >
              TRƯỚC
            </button>
            <div className="px-4 text-xs font-bold text-stone-500">
              {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
              disabled={currentPage === totalPages}
              className="px-4 py-1.5 text-xs font-bold border border-stone-200 rounded-lg disabled:opacity-30 bg-white"
            >
              SAU
            </button>
          </div>
        )}
        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
          Ghi nhận {sortedPersons.length} kết quả
        </div>
      </div>
    </div>
  );
}
