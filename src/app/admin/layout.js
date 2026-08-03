import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Portal | My Services",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-base-200/40">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-10">{children}</div>
    </div>
  );
}
