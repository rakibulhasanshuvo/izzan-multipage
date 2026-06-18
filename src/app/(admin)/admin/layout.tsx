import "material-symbols/outlined.css";
import React from "react";
import SideNavBar from "@/components/admin/SideNavBar";
import TopAppBar from "@/components/admin/TopAppBar";
import { AdminSidebarProvider } from "@/components/admin/AdminSidebarContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-body-md transition-colors duration-300">
      <AdminSidebarProvider>
        <SideNavBar />
        <div className="flex flex-col flex-1">
          <TopAppBar />
          <main className="ml-0 md:ml-[260px] p-4 md:p-10 xl:p-12 max-w-[1440px] mx-auto w-full md:w-[calc(100%-260px)]">
            {children}
          </main>
        </div>
      </AdminSidebarProvider>
    </div>
  );
}
