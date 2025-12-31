import type { Metadata } from "next";
import "./globals.css"; // Import CSS toàn cục (Tailwind)

export const metadata: Metadata = {
  title: "Luxury Decor",
  description: "Nội thất sang trọng đẳng cấp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      {/* body là nơi chứa toàn bộ nội dung của các page.tsx */}
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}