"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, UserCircle, Printer, Users, Settings, LogOut } from "lucide-react";
import AdminPrintConfig from "./AdminPrintConfig";

interface HeaderMenuProps {
  isAdmin: boolean;
  userEmail?: string;
  setView: (view: string) => void;
  setPrintConfig: (config: any) => void;
}

export default function HeaderMenu({ isAdmin, userEmail, setView, setPrintConfig }: HeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
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
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-stone-200 p-1 pr-3 rounded-full shadow-sm hover:shadow-md transition-all"
      >
        <div className="size-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
          {userEmail?.charAt(0).toUpperCase() || "U"}
        </div>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-2xl shadow-2xl py-2 z-50"
          >
            <div className="px-4 py-2 border-b border-stone-100 mb-1">
              <p className="text-[10px] text-stone-400 uppercase font-bold">Tài khoản</p>
              <p className="text-sm font-medium truncate">{userEmail}</p>
            </div>

            {isAdmin && (
              <button 
                onClick={() => { setShowConfig(true); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-bold transition-colors"
              >
                <Printer size={16} /> THIẾT LẬP IN A0
              </button>
            )}

            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
              <Settings size={16} /> Cấu hình hệ thống
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <LogOut size={16} /> Đăng xuất
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showConfig && (
        <AdminPrintConfig 
          onClose={() => setShowConfig(false)}
          onConfirm={(config) => {
            setPrintConfig(config);
            setView("print_a0");
            setShowConfig(false);
          }}
        />
      )}
    </div>
  );
}
