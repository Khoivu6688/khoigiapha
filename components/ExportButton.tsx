"use client";

import { AnimatePresence, motion } from "framer-motion";
import { toJpeg, toPng } from "html-to-image";
import jsPDF from "jspdf";
import {
  AlertCircle,
  Code,
  Download,
  FileImage,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { generateSimpleFamilyTreeHTML } from "@/utils/familyTreeUtils";

// Props để nhận tree data từ parent
interface ExportButtonProps {
  treeData?: any[]; // Tree data cho export HTML
  branches?: any[]; // Branches data cho export HTML
}

export default function ExportButton({
  treeData,
  branches,
}: ExportButtonProps = {}) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format: "png" | "pdf" | "html") => {
    console.log(
      "Export clicked:",
      format,
      "treeData length:",
      treeData?.length,
      "branches length:",
      branches?.length,
    );

    try {
      setIsExporting(true);
      setShowMenu(false);
      setError(null);

      // Add a small delay to allow UI to update (close menu) before capturing
      await new Promise((resolve) => setTimeout(resolve, 100));

      const element = document.getElementById("export-container");
      if (!element) throw new Error("Không tìm thấy vùng dữ liệu để xuất.");

      if (format === "html") {
        // Always use current tree state from DOM, not cached treeData
        // This ensures we export the tree with the current root selection
        const clone = element.cloneNode(true) as HTMLElement;
        const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gia Phả Họ Vũ Bá - Thái Bình - ${new Date().toLocaleDateString("vi-VN")}</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: #f5f5f4;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        
        .person {
            margin: 10px 0;
            padding: 15px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .person:hover {
            border-color: #d97706;
            box-shadow: 0 4px 6px rgba(217, 119, 6, 0.1);
        }
        
        .person.male {
            border-left: 4px solid #3b82f6;
        }
        
        .person.female {
            border-left: 4px solid #ec4899;
        }
        
        .generation {
            font-size: 12px;
            font-weight: bold;
            color: #6b7280;
            margin-bottom: 5px;
        }
        
        .person-info h3 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
        }
        
        .person-info p {
            margin: 2px 0;
            font-size: 12px;
            color: #6b7280;
        }
        
        .children {
            margin-left: 40px;
            border-left: 2px solid #e5e7eb;
            padding-left: 10px;
        }
        
        .toggle {
            cursor: pointer;
            user-select: none;
            margin-right: 8px;
            font-size: 12px;
            color: #6b7280;
        }
        
        @media print {
            body { padding: 0; }
            .person { 
                page-break-inside: avoid;
                border: 1px solid #000;
            }
        }
    </style>
</head>
<body>
    ${clone.innerHTML}
</body>
</html>`;

        // Create and download HTML file (only if htmlContent exists)
        if (htmlContent) {
          const blob = new Blob([htmlContent], {
            type: "text/html;charset=utf-8",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `giapha-${new Date().toISOString().split("T")[0]}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        // Existing PNG and PDF export logic
        element.classList.add("exporting");

        // Get actual dimensions
        const rect = element.getBoundingClientRect();
        const width = Math.max(element.scrollWidth, rect.width);
        const height = Math.max(element.scrollHeight, rect.height);

        const exportOptions = {
          cacheBust: true,
          backgroundColor: "#ffffff", // White background instead of #f5f5f4
          pixelRatio: 2,
          width: width,
          height: height,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
            width: `${width}px`,
            height: `${height}px`,
          },
          filter: (node: any) => {
            // Exclude problematic elements
            if (node.tagName?.toLowerCase() === "script") return false;
            if (node.tagName?.toLowerCase() === "style") return false;
            return true;
          },
        };

        if (format === "png") {
          const url = await toPng(element, exportOptions);
          const a = document.createElement("a");
          a.href = url;
          a.download = `giapha-sodo-${new Date().toISOString().split("T")[0]}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else if (format === "pdf") {
          const imgData = await toJpeg(element, {
            ...exportOptions,
            quality: 0.95,
          });

          // Get the actual width and height of the element to calculate PDF dimensions
          const width = element.scrollWidth;
          const height = element.scrollHeight;

          const pdf = new jsPDF({
            orientation: width > height ? "landscape" : "portrait",
            unit: "px",
            format: [width, height],
          });
          pdf.addImage(imgData, "JPEG", 0, 0, width, height);
          pdf.save(`giapha-sodo-${new Date().toISOString().split("T")[0]}.pdf`);
        }

        element.classList.remove("exporting");
      }
    } catch (err) {
      console.error("Export error:", err);
      setError("Đã xảy ra lỗi khi xuất file. Vui lòng thử lại.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="btn"
      >
        {isExporting ? (
          <Loader2 className="size-4 shrink-0 animate-spin" />
        ) : (
          <Download className="size-4 shrink-0" />
        )}
        <span className="tracking-wide min-w-max">
          {isExporting ? "Đang xuất..." : "Xuất file"}
        </span>
      </button>

      <AnimatePresence>
        {showMenu && !isExporting && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-stone-200/60 py-2 z-50 overflow-hidden"
          >
            <button
              onClick={() => handleExport("html")}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-700 hover:text-amber-700 hover:bg-amber-50 transition-colors text-left"
            >
              <Code className="size-4" />
              Lưu thành HTML
            </button>
            <button
              onClick={() => handleExport("png")}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-700 hover:text-amber-700 hover:bg-amber-50 transition-colors text-left"
            >
              <FileImage className="size-4" />
              Lưu thành Ảnh (PNG)
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-700 hover:text-amber-700 hover:bg-amber-50 transition-colors text-left"
            >
              <FileText className="size-4" />
              Lưu thành PDF
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full right-0 mt-2 w-64 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 flex flex-col gap-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-red-800 leading-snug">
                  {error}
                </span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
