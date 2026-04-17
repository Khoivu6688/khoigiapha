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
  const [totalCount, setTotalCount] = useState(propTotalCount || 0);
  const [filterOption, setFilterOption] = useState("all");

  const filteredPersons = initialPersons.filter((person) => {
    const matchesSearch = person.full_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    switch (filterOption) {
      case "male":
        matchesFilter = person.gender === "male";
        break;
      case "female":
        matchesFilter = person.gender === "female";
        break;
      case "in_law_female":
        matchesFilter = person.gender === "female" && person.is_in_law;
        break;
      case "in_law_male":
        matchesFilter = person.gender === "male" && person.is_in_law;
        break;
      case "deceased":
        matchesFilter = person.is_deceased;
        break;
      case "first_child":
        matchesFilter = person.birth_order === 1;
        break;
      default:
        matchesFilter = true;
        break;
    }

    return matchesSearch && matchesFilter;
  });

  const sortedPersons = [...filteredPersons].sort((a, b) => {
    switch (sortOption) {
      case "name_asc":
        return a.full_name.localeCompare(b.full_name);
      case "name_desc":
        return b.full_name.localeCompare(a.full_name);
      case "birth_asc":
        return (a.birth_year || 0) - (b.birth_year || 0);
      case "birth_desc":
        return (b.birth_year || 0) - (a.birth_year || 0);
      case "generation_asc":
        return (a.generation || 0) - (b.generation || 0);
      case "generation_desc":
        return (b.generation || 0) - (a.generation || 0);
      case "updated_asc":
        return new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime();
      default:
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
    }
  });

  const totalPages = Math.ceil(sortedPersons.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPersons = sortedPersons.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setTotalCount(filteredPersons.length);
    setCurrentPage(1);
  }, [searchTerm, filterOption, filteredPersons.length]);

  return (
    <div className="max-w-6xl mx-auto w-full -mt-4"> {/* Đẩy cao cả khối lên bằng -mt-4 và thu hẹp max-w */}
      <div className="mb-6 relative">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white/70 backdrop-blur-md p-2.5 rounded-xl border border-stone-200/60 shadow-sm transition-all duration-300">
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-1 items-center">
            {/* Thanh tìm kiếm nhỏ gọn hơn */}
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Tìm thành viên..."
                className="bg-white/90 text-stone-900 w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200/80 text-sm placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {/* Thẻ Lọc nhỏ lại */}
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-stone-400 pointer-events-none" />
                <select
                  className="appearance-none bg-white/90 text-stone-700 w-28 pl-8 pr-7 py-2 rounded-lg border border-stone-200/80 text-xs font-semibold focus:outline-none focus:border-amber-400 transition-all cursor-pointer"
                  value={filterOption}
                  onChange={(e) => setFilterOption(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="in_law_female">Dâu</option>
                  <option value="in_law_male">Rể</option>
                  <option value="deceased">Đã mất</option>
                </select>
                <div className="absolute inset-y-0 right-1.5 flex items-center pointer-events-none">
                  <ArrowUpDown className="size-3 text-stone-300" />
                </div>
              </div>

              {/* Thẻ Sắp xếp nhỏ lại */}
              <div className="relative">
                <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-stone-400 pointer-events-none" />
                <select
                  className="appearance-none bg-white/90 text-stone-700 w-40 pl-8 pr-7 py-2 rounded-lg border border-stone-200/80 text-xs font-semibold focus:outline-none focus:border-amber-400 transition-all cursor-pointer"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="birth_asc">Năm sinh ↑</option>
                  <option value="birth_desc">Năm sinh ↓</option>
                  <option value="name_asc">Tên A-Z</option>
                  <option value="updated_desc">Mới nhất</option>
                  <option value="generation_asc">Đời ↑</option>
                </select>
                <div className="absolute inset-y-0 right-1.5 flex items-center pointer-events-none">
                  <ArrowUpDown className="size-3 text-stone-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Nút thêm mới nhỏ gọn */}
          {canEdit && (
            <Link 
              href="/dashboard/members/new" 
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shadow-amber-200 whitespace-nowrap"
            >
              <Plus className="size-3.5" strokeWidth={3} />
              Thêm mới
            </Link>
          )}
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
        <div className="text-center py-10 text-stone-400 text-sm italic">
          Không tìm thấy thành viên phù hợp.
        </div>
      )}

      {/* Phân trang tinh gọn */}
      {sortedPersons.length > pageSize && (
        <div className="flex justify-center items-center gap-2 mt-8 mb-10">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-xs font-medium border border-stone-200 rounded-md hover:bg-stone-50 disabled:opacity-30 transition-colors"
          >
            Trước
          </button>
          <span className="text-xs text-stone-500 font-medium px-4">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-xs font-medium border border-stone-200 rounded-md hover:bg-stone-50 disabled:opacity-30 transition-colors"
          >
            Sau
          </button>
        </div>
      )}

      <div className="text-center text-[11px] text-stone-400 mt-2 mb-8 uppercase tracking-wider">
        Tổng số: {sortedPersons.length} thành viên
      </div>
    </div>
  );
}
