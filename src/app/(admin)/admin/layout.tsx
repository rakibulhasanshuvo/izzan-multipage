import "material-symbols/outlined.css";
import React from "react";
import SideNavBar from "@/components/admin/SideNavBar";
import TopAppBar from "@/components/admin/TopAppBar";
import { AdminSidebarProvider } from "@/components/admin/AdminSidebarContext";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Saved profile (name/avatar) drives the top bar so settings changes are
  // visible everywhere instead of only on /admin/settings.
  const settings = await prisma.adminSettings.findFirst();
  const adminName = settings ? `${settings.firstName} ${settings.lastName}`.trim() : undefined;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-body-md transition-colors duration-300">
      <AdminSidebarProvider>
        <SideNavBar />
        <div className="flex flex-col flex-1">
          <TopAppBar adminName={adminName} adminAvatarUrl={settings?.avatarUrl ?? null} />
          <main className="ml-0 md:ml-[260px] p-4 md:p-10 xl:p-12 max-w-[1440px] mx-auto w-full md:w-[calc(100%-260px)]">
            {children}
          </main>
        </div>
      </AdminSidebarProvider>
    </div>
  );
}
