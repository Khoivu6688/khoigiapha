import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import config from "./config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});
const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
});
export const metadata: Metadata = {
  title: {
    default: "Gia phả họ Vũ Bá - Thái Bình",
    template: "%s | Gia phả họ Vũ Bá - Thái Bình",
  },
  description:
    "Gia phả họ Vũ Bá - Thái Bình - "Cây có gốc mới nở nhành xanh lá, nước có nguồn mới bể rộng sông sâu.
Trang gia phả điện tử này được lập nên với tấm lòng thành kính, nhằm lưu giữ anh linh của tổ tiên và ghi dấu công đức của các bậc tiền hiền họ [Vũ Bá]. Đây không chỉ là cuốn sử liệu của dòng họ mà còn là nhịp cầu kết nối muôn phương, để con cháu đời đời soi rọi, biết ơn nguồn cội và cùng nhau gìn giữ nếp nhà",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gia phả họ Vũ Bá - Thái Bình",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="apple-mobile-web-app-title"
          content="Gia phả họ Vũ Bá - Thái Bình"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Gia phả họ Vũ Bá - Thái Bình" />
        <meta name="theme-color" content="#f59e0b" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased relative`}
      >
        {children}
      </body>
    </html>
  );
}
