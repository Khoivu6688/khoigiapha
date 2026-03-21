"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Highlighter,
  Plus,
  Trash2,
} from "lucide-react";

export interface RichTextEditorInnerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

const ToolbarButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    disabled={disabled}
    className={`p-2 rounded-md transition-colors ${
      isActive
        ? "bg-blue-100 text-blue-600"
        : "text-gray-600 hover:bg-gray-100 disabled:opacity-30"
    }`}
    title={title}
  >
    {children}
  </button>
);

export function RichTextEditorInner({
  value,
  onChange,
  placeholder,
  readOnly = false,
  className,
}: RichTextEditorInnerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Link.configure({ 
        openOnClick: false, 
        HTMLAttributes: { 
          class: 'text-blue-500 underline cursor-pointer' 
        } 
      }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: placeholder || 'Bắt đầu nhập nội dung...',
      }),
    ],
    immediatelyRender: false,
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rich-text-content focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  // Update content if value changes externally (e.g. from DB)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt("URL hình ảnh:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className={`border border-gray-200 rounded-md overflow-hidden bg-white ${className}`}>
      {!readOnly && (
        <div className="bg-gray-50 border-b border-gray-200 p-1 flex flex-wrap gap-1 sticky top-0 z-10">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Đậm (Bold)"
          >
            <Bold size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Nghiêng (Italic)"
          >
            <Italic size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Gạch chân (Underline)"
          >
            <UnderlineIcon size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Gạch ngang (Strikethrough)"
          >
            <Strikethrough size={18} />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Căn trái"
          >
            <AlignLeft size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Căn giữa"
          >
            <AlignCenter size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Căn phải"
          >
            <AlignRight size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            title="Căn đều"
          >
            <AlignJustify size={18} />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Danh sách dấu chấm"
          >
            <List size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Danh sách số"
          >
            <ListOrdered size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Trích dẫn"
          >
            <Quote size={18} />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

          <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Chèn link">
            <LinkIcon size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={addImage} title="Chèn ảnh">
            <ImageIcon size={18} />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

          <ToolbarButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Chèn bảng"
          >
            <TableIcon size={18} />
          </ToolbarButton>
          
          {editor.isActive('table') && (
            <>
              <ToolbarButton onClick={() => editor.chain().focus().addColumnBefore().run()} title="Thêm cột trước">
                <Plus size={14} className="rotate-90" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().addRowBefore().run()} title="Thêm hàng trước">
                <Plus size={14} />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Xóa bảng">
                <Trash2 size={14} className="text-red-500" />
              </ToolbarButton>
            </>
          )}

          <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

          <div className="flex items-center gap-1" title="Màu chữ">
            <input
              type="color"
              onInput={(event) => {
                editor.chain().focus().setColor((event.target as HTMLInputElement).value).run();
              }}
              value={editor.getAttributes("textStyle").color || "#000000"}
              className="w-8 h-8 p-1 cursor-pointer border-none bg-transparent"
            />
          </div>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffcc00' }).run()}
            isActive={editor.isActive('highlight')}
            title="Tô màu nền"
          >
            <Highlighter size={18} />
          </ToolbarButton>

          <div className="flex-1" />

          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác">
            <Undo size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại">
            <Redo size={18} />
          </ToolbarButton>
        </div>
      )}

      <EditorContent editor={editor} />

      <style jsx global>{`
        .rich-text-content {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
          line-height: 1.625;
          color: #374151;
        }
        .rich-text-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .rich-text-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .rich-text-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .rich-text-content p {
          margin-bottom: 1.25rem;
        }
        .rich-text-content table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1.5rem 0;
          overflow: hidden;
        }
        .rich-text-content table td,
        .rich-text-content table th {
          min-width: 1em;
          border: 1px solid #ced4da;
          padding: 8px 12px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .rich-text-content table th {
          font-weight: bold;
          text-align: left;
          background-color: #f8f9fa;
        }
        .rich-text-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .rich-text-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .rich-text-content li {
          margin-bottom: 0.25rem;
        }
        .rich-text-content pre {
          background: #0d0d0d;
          color: #fff;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .rich-text-content blockquote {
          padding-left: 1.5rem;
          border-left: 4px solid #e5e7eb;
          font-style: italic;
          margin-bottom: 1.25rem;
        }
        .rich-text-content hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }
        .rich-text-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 1.5rem auto;
          display: block;
        }
        .rich-text-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
