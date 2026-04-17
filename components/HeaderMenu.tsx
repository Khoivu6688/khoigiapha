"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, UserCircle, Users, FileText, Network, Database, Settings, CalendarClock, GitMerge, BarChart2, KeyRound, Info, Printer } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LogoutButton from "./LogoutButton";
import AdminPrintConfig from "./AdminPrintConfig";

interface HeaderMenuProps {
  isAdmin: boolean;
  userEmail?: string;
  setView: (view: string) => void;
  setPrintConfig: (config: any) => void;
}

export default function HeaderMenu({ isAdmin, userEmail, setView, setPrintConfig }: HeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showA0Config, setShowA0Config] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full hover:bg-stone-100 transition-all border border-transparent hover:border-stone-200 bg-white shadow-sm">
        <div className="size-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-inner ring-1 ring-amber-200">
          {userEmail ? userEmail.charAt(0).toUpperCase() : <UserCircle className="size-5" />}
        </div>
        <ChevronDown className={`size-4 text-stone-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 overflow-hidden">
            
            <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/50">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Tài khoản</p>
              <p className="text-sm font-bold text-stone-900 truncate">{userEmail}</p>
            </div>

            <div className="py-1 max-h-[70vh] overflow-y-auto">
              {isAdmin && (
                <>
                  <button onClick={() => { setIsOpen(false); setShowA0Config(true); }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-black text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors w-full text-left">
                    <Printer className="size-4" /> THIẾT LẬP IN A0
                  </button>
                  <Link href="/dashboard/users" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"><Users className="size-4" /> Quản lý Người dùng</Link>
                  <Link href="/dashboard/data" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"><Database className="size-4" /> Sao lưu & Phục hồi</Link>
                </>
              )}
              <button onClick={() => { setView("tree"); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"><Network className="size-4" /> Xem sơ đồ cây</button>
              <LogoutButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showA0Config && (
        <AdminPrintConfig onClose={() => setShowA0Config(false)} 
          onConfirm={(data) => { setPrintConfig(data); setView("print_a0"); setShowA0Config(false); }} />
      )}
    </div>
  );
}
