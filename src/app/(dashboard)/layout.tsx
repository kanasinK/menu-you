import { Metadata } from "next";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "ระบบจัดการงานพิมพ์",
  description: "ระบบจัดการออเดอร์และงานพิมพ์",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex h-screen bg-gray-50 w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-gray-50 p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
