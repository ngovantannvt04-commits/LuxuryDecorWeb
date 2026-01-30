"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { AuthUser } from "@/types/auth.types";
import { Camera, Save, User, MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // State cho upload ảnh
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    address: "",
    avatar: ""
  });

  // Load dữ liệu khi vào trang
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Gọi API lấy dữ liệu mới nhất từ DB
        const userData = await userService.getMyProfile();
        setUser(userData);
        
        // Fill dữ liệu vào form
        setFormData({
          phoneNumber: userData.phoneNumber || "",
          address: userData.address || "",
          avatar: userData.avatar || ""
        });
      } catch (error) {
        console.error("Lỗi tải profile:", error);
        // Nếu lỗi, đá về login
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate loại file
    if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh");
        return;
    }

    // Validate dung lượng (<10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert("Dung lượng ảnh quá lớn (tối đa 10MB)");
        return;
    }

    try {
        setUploading(true);
        // Gọi API Upload
        const res = await userService.uploadAvatar(file);
        
        // Cập nhật UI ngay lập tức
        // res.avatar là URL mới trả về từ Cloudinary
        setFormData(prev => ({ ...prev, avatar: res.avatar || "" }));
        
        // Cập nhật cả object user để đồng bộ hiển thị
        if (user) {
            const updatedUser = { ...user, avatar: res.avatar };
            setUser(updatedUser);
            
            // Cập nhật localStorage luôn để Header nhận diện ngay
            const token = localStorage.getItem("accessToken");
            const refreshToken = localStorage.getItem("refreshToken");
            if (token && refreshToken) {
                authService.setSession(token, refreshToken, updatedUser);
                // Dispatch event để Header (nếu dùng event listener) cập nhật, hoặc reload trang sau khi save
            }
        }
        
        alert("Đổi ảnh đại diện thành công!");
    } catch (error) {
        console.error(error);
        alert("Lỗi khi upload ảnh. Vui lòng thử lại.");
    } finally {
        setUploading(false);
        // Reset input để cho phép chọn lại cùng 1 file nếu muốn
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Xử lý lưu thay đổi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Gọi API cập nhật
      const updatedUser = await userService.updateProfile(formData);
      
      // Cập nhật UI
      setUser(updatedUser);
      alert("Cập nhật thông tin thành công!");

      // Cập nhật lại localStorage để Header hiển thị đúng Avatar mới
      // lấy token cũ để set lại session
      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      if (token && refreshToken) {
          authService.setSession(token, refreshToken, updatedUser);
          // Reload nhẹ để Header nhận diện thay đổi (hoặc dùng Context nếu muốn mượt hơn)
          window.location.reload(); 
      }

    } catch (error) {
      alert("Có lỗi xảy ra khi cập nhật.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-sans font-bold mb-8 text-center text-gray-800">Hồ Sơ Của Bạn</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* === CỘT TRÁI: AVATAR CARD === */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100 sticky top-24">
              {/* Vùng Avatar Clickable */}
              <div 
                className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner group cursor-pointer"
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                 {/* Avatar Preview */}
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img 
                   src={formData.avatar || "/logo-niri-main.png"} 
                   alt="Avatar" 
                   className={`w-full h-full object-cover transition duration-300 ${uploading ? 'opacity-50' : ''}`}
                   onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.src = "/logo-niri-main.png";
                   }}
                 />
                 
                 {/* Overlay hướng dẫn & Loading */}
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    {uploading ? (
                        <Loader2 className="text-white animate-spin" size={24} />
                    ) : (
                        <Camera className="text-white" size={24} />
                    )}
                 </div>
              </div>
              
              {/* Input File Ẩn */}
              <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*"
                 onChange={handleFileChange}
              />
              
              <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
              <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
              
              <div className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-xs font-bold inline-block uppercase">
                 Thành viên {user?.role}
              </div>
            </div>
          </div>

          {/* === CỘT PHẢI: FORM CHỈNH SỬA === */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-4">
                 <User size={20} /> Thông tin cá nhân
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Email (Readonly) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email (Không thể thay đổi)</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input 
                            type="email" 
                            disabled
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                            value={user?.email}
                        />
                    </div>
                </div>

                {/* Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:outline-none transition"
                                placeholder="09xx..."
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Address Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ nhận hàng</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:outline-none transition"
                            placeholder="Số nhà, đường, quận/huyện..."
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={saving}
                        className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? "Đang lưu..." : <><Save size={18} /> Lưu thay đổi</>}
                    </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}