"use client";
import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = authService.getUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}