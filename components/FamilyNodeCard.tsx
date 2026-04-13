"use client";

import { Person } from "@/types";
import Image from "next/image";
import { useDashboard } from "./DashboardContext";
import { usePrefixes } from "./PrefixContext";
import DefaultAvatar from "./DefaultAvatar";

interface FamilyNodeCardProps {
  person: Person;
  role?: string; // e.g., "Chồng", "Vợ"
  note?: string | null;
  onClickCard?: () => void;
  onClickName?: (e: React.MouseEvent) => void;
  onClickSetRoot?: () => void; // New prop for setting as root
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggleCollapse?: () => void;
  isRingVisible?: boolean;
  isPlusVisible?: boolean;
}

export default function FamilyNodeCard({
  person,
  onClickCard,
  onClickName,
  onClickSetRoot,
  isExpandable = false,
  isExpanded = false,
  onToggleCollapse,
  isRingVisible = false,
  isPlusVisible = false,
}: FamilyNodeCardProps) {
  const { showAvatar, setMemberModalId } = useDashboard();
  const { getPrefixName } = usePrefixes();

  const isDeceased = person.is_deceased;

  // Get prefix name
  const name = getPrefixName(person.prefix_id);
  console.log(
    "FamilyNodeCard Debug - Person:",
    person.full_name,
    "prefixId:",
    person.prefix_id,
    "name:",
    name,
  );

  // Calculate generation offset for visual positioning
  const generationOffset = person.generation ? (person.generation - 1) * 15 : 0; // 15px per generation

  const content = (
    <div
      onClick={() => {
        if (onClickSetRoot) {
          onClickSetRoot();
        } else if (onClickCard) {
          onClickCard();
        }
      }}
      title={onClickSetRoot ? "Click để đặt làm gốc" : undefined}
      className={`group py-2 px-1 w-20 sm:w-24 md:w-28 flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative bg-white/70 rounded-2xl
        ${isDeceased ? "grayscale-[0.4] opacity-80" : ""}
      `}
    >
      {isRingVisible && (
        <div
          className="absolute top-[15%] -left-2.5 sm:-left-4 size-5 sm:size-6 rounded-full shadow-sm bg-white z-100 flex items-center justify-center text-[10px] sm:text-sm"
          style={{ marginTop: `${generationOffset}px` }}
        >
          <span className="leading-none pt-px pl-0.5">💍</span>
        </div>
      )}
      {isPlusVisible && (
        <div
          className="absolute top-[15%] -left-2.5 sm:-left-4 size-5 sm:size-6 rounded-full shadow-sm bg-white z-100 flex items-center justify-center text-[10px] sm:text-sm font-medium text-stone-500"
          style={{ marginTop: `${generationOffset}px` }}
        >
          <span className="leading-none mb-px pl-0.5">+</span>
        </div>
      )}
      {/* Decorative gradient blob for the card background hover */}
      {/* <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0 ${person.gender === "male" ? "bg-sky-400" : person.gender === "female" ? "bg-rose-400" : "bg-stone-400"}`}
      /> */}



      {/* 1. Avatar */}
      {showAvatar && (
        <div className="relative z-10 mb-1.5 sm:mb-2">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setMemberModalId(person.id);
            }}
            title="Xem chi tiết thành viên"
            className={`cursor-pointer h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm text-white overflow-hidden shrink-0 shadow-lg ring-2 ring-white transition-transform duration-300 group-hover:scale-105
              ${
                person.gender === "male"
                  ? "bg-linear-to-br from-sky-400 to-sky-700"
                  : person.gender === "female"
                    ? "bg-linear-to-br from-rose-400 to-rose-700"
                    : "bg-linear-to-br from-stone-400 to-stone-600"
              }`}
          >
            {person.avatar_url ? (
              <Image
                unoptimized
                src={person.avatar_url}
                alt={person.full_name}
                className="w-full h-full object-cover"
                width={64}
                height={64}
              />
            ) : (
              <DefaultAvatar gender={person.gender} />
            )}
          </div>
        </div>
      )}

      {/* 2. Gender Icon + Name */}
      <div className="flex flex-col items-center justify-center gap-1 w-full px-0.5 sm:px-1 relative z-10">
        <span
          className={`text-[10px] sm:text-[11px] md:text-xs font-bold text-center leading-tight line-clamp-2 transition-colors cursor-pointer
            ${onClickName ? "text-stone-800 group-hover:text-amber-700 hover:underline" : "text-stone-800 group-hover:text-amber-800"}`}
          title={person.full_name}
          onClick={(e) => {
            if (onClickName) {
              e.stopPropagation();
              e.preventDefault();
              onClickName(e);
            }
          }}
        >
          {name ? `${name} ${person.full_name}` : person.full_name}
        </span>
        {/* {person.birth_order != null && (
          <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200/60 leading-none">
            {person.birth_order === 1 ? "Trưởng" : `Thứ ${person.birth_order}`}
          </span>
        )} */}
        {/* {person.generation != null && (
          <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200/60 leading-none">
            Đ.{person.generation}
          </span>
        )} */}
        {/* {isDeceased && (
          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-stone-100 text-stone-400 uppercase tracking-wider border border-stone-200/50">
            Đã mất
          </span>
        )} */}
      </div>

    </div>
  );

  if (onClickCard || onClickName || onClickSetRoot) {
    return content;
  }

  return (
    <button onClick={() => setMemberModalId(person.id)} className="block w-fit">
      {content}
    </button>
  );
}
