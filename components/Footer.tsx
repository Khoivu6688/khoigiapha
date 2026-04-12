export interface FooterProps {
  className?: string;
  showDisclaimer?: boolean;
}

export default function Footer({
  className = "",
  showDisclaimer = false,
}: FooterProps) {
  return (
    <footer
      className={`pt-6 pb-10 text-center text-sm text-stone-500 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        {showDisclaimer && (
          <p className="mb-4 text-xs tracking-wide bg-amber-50 inline-block px-3 py-1 rounded-full text-amber-800/80 border border-amber-200/50">
            Nội dung có thể thiếu sót. Vui lòng đóng góp để gia phả chính xác hơn.
          </p>
        )}
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <a
            href="https://homielab.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-green-600 hover:text-amber-700 transition-colors"
          >
            Gia Phả VŨ BÁ TỘC - THÁI BÌNH
          </a>
          <span className="text-stone-400">|</span>
          <a
            href="https://www.facebook.com/khoivu68"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:text-amber-700 transition-colors"
          >
            Copyright &copy; 2026&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VŨ VĂN KHỞI
          </a>
        </p>
      </div>
    </footer>
  );
}
