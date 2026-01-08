"use client";

// Không cần check Auth hay Layout wrapper nữa vì layout.tsx đã lo hết rồi
export default function AdminDashboard() {
  return (
    <div>
       <h1 className="text-3xl font-bold text-gray-800 mb-6">Tổng quan</h1>
       
       {/* STATS CARDS */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <p className="text-gray-500 text-sm">Tổng doanh thu</p>
               <h3 className="text-2xl font-bold text-green-600">120,000,000đ</h3>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <p className="text-gray-500 text-sm">Đơn hàng mới</p>
               <h3 className="text-2xl font-bold text-blue-600">15</h3>
           </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <p className="text-gray-500 text-sm">Sản phẩm</p>
               <h3 className="text-2xl font-bold text-purple-600">48</h3>
           </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <p className="text-gray-500 text-sm">Khách hàng</p>
               <h3 className="text-2xl font-bold text-orange-600">128</h3>
           </div>
       </div>

       {/* CHART PLACEHOLDER (Ví dụ) */}
       <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-96 flex items-center justify-center bg-gray-50">
           <p className="text-gray-400">Biểu đồ thống kê doanh thu (Đang cập nhật...)</p>
       </div>
    </div>
  );
}