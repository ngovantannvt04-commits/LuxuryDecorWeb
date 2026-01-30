import type { Metadata } from "next";
import "./globals.css"; // Import CSS toàn cục (Tailwind)
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Luxury Decor",
  description: "Nội thất sang trọng đẳng cấp",
  icons: {
    icon: [
      { url: '/favicon/web-app-manifest-512x512.png', href: '/favicon/web-app-manifest-512x512.png' },
      // { url: 'https://res.cloudinary.com/.../logo.png' }
    ],
  },
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
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}