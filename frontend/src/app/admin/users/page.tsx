"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import { AuthUser, PageResponse } from "@/types/auth.types";
import { Edit, Trash2, Plus, Search, X, User as UserIcon, ShieldCheck, Mail, Phone } from "lucide-react";
import { AxiosError } from "node_modules/axios/index.cjs";

export default function AdminUsersPage() {
  // === STATE DATA ===
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // === STATE MODAL ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    username: "",
    password: "", // Chỉ dùng khi tạo mới
    email: "",
    role: "CUSTOMER",
    phoneNumber: "",
    address: "",
    avatar: ""
  });

  // 1. Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Ép kiểu kết quả trả về thành PageResponse<AuthUser>
      const res = await userService.getAllUsers({
        page,
        size: 10,
        keyword,
      }) as unknown as PageResponse<AuthUser>; 
      // Lưu ý: 'as unknown as ...' dùng để ép kiểu an toàn nếu axios trả về any

      setUsers(res.content);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, keyword]); // Reload khi page hoặc keyword đổi

  // 2. Open Modal Logic
  const openModal = (user?: AuthUser) => {
    if (user) {
      // MODE EDIT
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: "", // Không hiển thị password cũ
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        avatar: user.avatar || ""
      });
    } else {
      // MODE CREATE
      setEditingUser(null);
      setFormData({
        username: "",
        password: "",
        email: "",
        role: "USER",
        phoneNumber: "",
        address: "",
        avatar: ""
      });
    }
    setIsModalOpen(true);
  };

  // 3. Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // UPDATE
        await userService.updateUser(editingUser.userId, {
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            avatar: formData.avatar,
            role: formData.role
        });
        alert("Cập nhật thành công!");
      } else {
        // CREATE
        await userService.createUser({
            username: formData.username,
            password: formData.password,
            email: formData.email,
            role: formData.role,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            avatar: formData.avatar
        });
        alert("Tạo tài khoản thành công!");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Có lỗi xảy ra";
        alert("Lỗi: " + message);
    }
  };

  // 4. Delete User
  const handleDelete = async (userId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa user này? Hành động này không thể hoàn tác.")) {
      try {
        await userService.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        alert("Không thể xóa user này.");
      }
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Tài khoản</h1>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm"
        >
          <Plus size={20} /> Thêm tài khoản
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
           <input 
              type="text" 
              placeholder="Tìm kiếm theo username hoặc email..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={keyword}
              onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(0); 
              }}
           />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-sm">
            <tr>
              <th className="p-4 border-b">User</th>
              <th className="p-4 border-b">Thông tin liên hệ</th>
              <th className="p-4 border-b">Vai trò</th>
              <th className="p-4 border-b text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600">
            {loading ? (
               <tr key="loading"><td colSpan={4} className="p-6 text-center">Đang tải dữ liệu...</td></tr>
            ) : users.length === 0 ? (
               <tr key="empty"><td colSpan={4} className="p-6 text-center">Không tìm thấy tài khoản nào.</td></tr>
            ) : (
               users.map((user) => (
                 <tr key={user.userId} className="hover:bg-gray-50 border-b last:border-0">
                    {/* Cột User Info */}
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border bg-gray-100 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={user.avatar || "/logo-niri-main.png"} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/logo-niri-main.png";
                                    }}
                                />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">{user.username}</div>
                                <div className="text-xs text-gray-500">ID: #{user.userId}</div>
                            </div>
                        </div>
                    </td>

                    {/* Cột Contact */}
                    <td className="p-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Mail size={14}/> {user.email}
                            </div>
                            {user.phoneNumber && (
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <Phone size={14}/> {user.phoneNumber}
                                </div>
                            )}
                        </div>
                    </td>

                    {/* Cột Role */}
                    <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 ${
                            user.role === "ADMIN" 
                            ? "bg-purple-100 text-purple-700 border border-purple-200" 
                            : "bg-green-100 text-green-700 border border-green-200"
                        }`}>
                            {user.role === "ADMIN" ? <ShieldCheck size={12}/> : <UserIcon size={12}/>}
                            {user.role}
                        </span>
                    </td>

                    {/* Cột Actions */}
                    <td className="p-4">
                        <div className="flex justify-center gap-2">
                            <button 
                                onClick={() => openModal(user)}
                                className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Sửa"
                            >
                                <Edit size={16} />
                            </button>
                            <button 
                                onClick={() => handleDelete(user.userId)}
                                className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Xóa"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </td>
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="mt-6 flex justify-end gap-2">
         <button 
            disabled={page === 0} 
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
         >Trước</button>
         <span className="px-4 py-2 bg-white border rounded">Trang {page + 1} / {totalPages}</span>
         <button 
            disabled={page >= totalPages - 1} 
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
         >Sau</button>
      </div>

      {/* === MODAL FORM === */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-800">
                        {editingUser ? `Chỉnh sửa: ${editingUser.username}` : "Thêm tài khoản mới"}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Account Info Section */}
                    <div className="bg-blue-50 p-4 rounded-lg space-y-4 border border-blue-100">
                        <h3 className="font-bold text-blue-800 text-sm uppercase">Thông tin đăng nhập</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username (*)</label>
                                <input 
                                    type="text" required
                                    disabled={!!editingUser} // Không cho sửa username khi Edit
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-200"
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (*)</label>
                                <input 
                                    type="email" required
                                    disabled={!!editingUser} // Không cho sửa email khi Edit (tuỳ logic)
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-200"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Password chỉ hiện khi Tạo mới */}
                        {!editingUser && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu (*)</label>
                                <input 
                                    type="password" required
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        )}

                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò (Role)</label>
                             <select 
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value})}
                             >
                                <option value="CUSTOMER">CUSTOMER (Khách hàng)</option>
                                <option value="ADMIN">ADMIN (Quản trị viên)</option>
                             </select>
                        </div>
                    </div>

                    {/* Personal Info Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 text-sm uppercase border-b pb-2">Thông tin cá nhân</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input 
                                    type="text"
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                <input 
                                    type="text"
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Link</label>
                            <input 
                                type="text"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.avatar}
                                onChange={e => setFormData({...formData, avatar: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                        >Hủy</button>
                        <button 
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            {editingUser ? "Lưu thay đổi" : "Tạo tài khoản"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}