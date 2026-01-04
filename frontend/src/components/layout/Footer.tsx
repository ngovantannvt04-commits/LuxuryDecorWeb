import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Cột 1: Thông tin */}
          <div>
            <h3 className="text-2xl font-serif font-bold mb-4">NIRI</h3>
            <p className="text-gray-400 text-sm mb-4">
              Mang đến không gian sống đẳng cấp và sang trọng với những sản phẩm nội thất tinh tế nhất.
            </p>
            <div className="flex space-x-4">
                <Facebook className="text-gray-400 hover:text-white cursor-pointer" size={20} />
                <Instagram className="text-gray-400 hover:text-white cursor-pointer" size={20} />
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h4 className="font-bold text-lg mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white">Trang chủ</Link></li>
                <li><Link href="/products" className="hover:text-white">Sản phẩm</Link></li>
                <li><Link href="/about" className="hover:text-white">Về chúng tôi</Link></li>
                <li><Link href="/contact" className="hover:text-white">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Cột 3: Chính sách */}
          <div>
            <h4 className="font-bold text-lg mb-4">Chính sách</h4>
            <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/policy" className="hover:text-white">Chính sách bảo hành</Link></li>
                <li><Link href="/shipping" className="hover:text-white">Chính sách vận chuyển</Link></li>
                <li><Link href="/return" className="hover:text-white">Đổi trả hàng</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Bảo mật thông tin</Link></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h4 className="font-bold text-lg mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex gap-2"><MapPin size={18} /> Hà Nội, Việt Nam</li>
                <li className="flex gap-2"><Phone size={18} /> 0355 681 651</li>
                <li className="flex gap-2"><Mail size={18} /> niri.luxurydecor@gmail.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
           © 2026 NiRi Luxury Decor. All rights reserved.
        </div>
      </div>
    </footer>
  );
}