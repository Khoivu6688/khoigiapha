"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Settings, LogOut } from "lucide-react";

export default function HeaderMenu({ isAdmin, userEmail }: { isAdmin: boolean; userEmail?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 bg-white border border-stone-200 p-1 pr-3 rounded-full shadow-sm">
        <div className="size-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
          {userEmail?.charAt(0).toUpperCase() || "U"}
        </div>
        <ChevronDown size={14} className={isOpen ? "rotate-180" : ""} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-50">
          <div className="px-4 py-2 border-b border-stone-100 mb-1 text-xs text-stone-400 font-bold truncate italic">{userEmail}</div>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"><Settings size={16} /> Cấu hình</button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut size={16} /> Đăng xuất</button>
        </div>
      )}
    </div>
  );
}
