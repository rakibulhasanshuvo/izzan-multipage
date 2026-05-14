import React from "react";
import { prisma } from "@/lib/db";
import SettingsFormClient from "@/components/admin/SettingsFormClient";
import { AdminSettings } from "@/generated/client";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export default async function SettingsPage() {
  const settings = await prisma.adminSettings.findFirst();
  
  const session = await getServerSession(authOptions);
  const adminId = session?.user ? (session.user as any).id : null;
  const admin = adminId 
    ? await prisma.admin.findUnique({ where: { id: adminId } }) 
    : await prisma.admin.findFirst();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="font-serif text-[36px] text-zinc-900 dark:text-zinc-100 leading-tight mb-2">Preferences</h1>
        <p className="text-[16px] text-zinc-500 dark:text-zinc-400">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Navigation */}
        <div className="lg:col-span-3 space-y-2 sticky top-28">
          <a href="#profile" className="block px-4 py-3 rounded-2xl bg-zinc-900 dark:bg-primary text-white font-medium text-[15px] shadow-lg shadow-zinc-900/20 dark:shadow-primary/20 transition-all">
            Profile
          </a>
          <a href="#notifications" className="block px-4 py-3 rounded-2xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium text-[15px] transition-all">
            Notifications
          </a>
          <a href="#security" className="block px-4 py-3 rounded-2xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium text-[15px] transition-all">
            Security
          </a>
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-9 space-y-8">
          <SettingsFormClient 
            initialSettings={settings || {} as AdminSettings} 
            adminUsername={admin?.username || ""}
          />
        </div>
      </div>
    </div>
  );
}
