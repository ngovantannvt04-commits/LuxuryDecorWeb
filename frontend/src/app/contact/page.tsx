"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { userService } from "@/services/user.service";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  // State quản lý trạng thái gửi
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.sendMessage(formData);
      alert(`Cảm ơn ${formData.name}! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất.`);
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Lỗi gửi mail: ", error);
      alert("Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau hoặc gọi hotline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <Header />
      
      {/* Hero Banner */}
      <div className="bg-gray-900 text-white py-20 text-center">
        <h1 className="text-4xl font-serif font-bold mb-4">Liên Hệ Với Chúng Tôi</h1>
        <p className="text-gray-300">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn kiến tạo không gian sống.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Info */}
            <div>
                <h2 className="text-2xl font-bold font-serif mb-6">Thông tin liên lạc</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    NiRi Luxury Decor chuyên cung cấp các sản phẩm nội thất cao cấp. 
                    Hãy ghé thăm showroom của chúng tôi hoặc liên hệ qua các kênh trực tuyến để được tư vấn chi tiết nhất.
                </p>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-gray-100 p-3 rounded-full">
                            <MapPin className="text-black" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Showroom Chính</h3>
                            <p className="text-gray-600">123 Đường Cầu Diễn, Bắc Từ Liêm, TP. Hà Nội</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-gray-100 p-3 rounded-full">
                            <Phone className="text-black" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Hotline</h3>
                            <p className="text-gray-600">0355 681 651 (8:00 - 21:00)</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-gray-100 p-3 rounded-full">
                            <Mail className="text-black" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Email</h3>
                            <p className="text-gray-600">support@niridecor.com</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 p-8 rounded-2xl shadow-sm h-fit">
                <h2 className="text-2xl font-bold mb-6">Gửi tin nhắn</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                        <input 
                            type="text" 
                            required
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition disabled:bg-gray-100"
                            placeholder="Nhập tên của bạn"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input 
                            type="email" 
                            required
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition disabled:bg-gray-100"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lời nhắn</label>
                        <textarea 
                            required
                            rows={4}
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition disabled:bg-gray-100"
                            placeholder="Bạn cần tư vấn sản phẩm nào?"
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <Send size={18} />}
                        {loading ? "Đang gửi..." : "Gửi tin nhắn"}
                    </button>
                </form>
            </div>
        </div>
      </div>

      {/* Map (Optional - Ảnh giả lập bản đồ) */}
      <div className="h-96 bg-gray-200 relative">
         <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.57050712561!2d105.73844971108778!3d21.04986438052386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454f0d6347175%3A0x9769e9dbc4ccfb5c!2zTWnhur91IMSQ4buTbmcgQ-G7lQ!5e0!3m2!1svi!2s!4v1768127954355!5m2!1svi!2s"
            width="100%" 
            height="100%" 
            style={{border:0}} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="grayscale hover:grayscale-0 transition duration-500"
         ></iframe>
      </div>

      <Footer />
    </div>
  );
}