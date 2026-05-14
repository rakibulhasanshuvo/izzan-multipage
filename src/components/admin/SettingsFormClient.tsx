"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateSettings, updateAdminCredentials } from "@/app/(admin)/admin/actions";
import { signOut } from "next-auth/react";

import { AdminSettings } from "@/generated/client";

export default function SettingsFormClient({ initialSettings, adminUsername }: { initialSettings: AdminSettings, adminUsername: string }) {
  const router = useRouter();
  
  const [firstName, setFirstName] = useState(initialSettings?.firstName || "");
  const [lastName, setLastName] = useState(initialSettings?.lastName || "");
  const [email, setEmail] = useState(initialSettings?.email || "");
  const [bio, setBio] = useState(initialSettings?.bio || "");
  
  const [emailAlerts, setEmailAlerts] = useState(initialSettings?.emailAlerts ?? true);
  const [orderNotifs, setOrderNotifs] = useState(initialSettings?.orderNotifs ?? true);
  const [marketingUpdates, setMarketingUpdates] = useState(initialSettings?.marketingUpdates ?? false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);

  const [username, setUsername] = useState(adminUsername);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    
    try {
      await updateSettings({
        firstName, lastName, email, bio, emailAlerts, orderNotifs, marketingUpdates
      });

      toast.success("Settings saved successfully.");
      router.refresh();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Error saving settings");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    setSavingSecurity(true);

    try {
      await updateAdminCredentials({
        currentPassword,
        newUsername: username,
        newPassword
      });

      toast.success("Security credentials updated. Please log in again.");
      setTimeout(() => {
        signOut({ callbackUrl: "/admin/login" });
      }, 1500);
    } catch (error: any) {
      console.error("Error updating security:", error);
      toast.error(error.message || "Error updating security credentials");
    } finally {
      setSavingSecurity(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Profile Section */}
      <section id="profile" className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-3xl p-8 md:p-10 border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-colors duration-300">
        <div className="mb-8">
          <h3 className="font-serif text-[28px] text-zinc-900 dark:text-zinc-100 leading-tight mb-1">Profile</h3>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400">Update your personal information.</p>
        </div>

        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden border-4 border-white dark:border-zinc-800 shadow-md flex-shrink-0 relative">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYBjMwG0nbuaC6Ox9ovV4Emlpn6-VBpvR9GaxVe4Ld8vPv6v8ljiLEFNx8N8A8nPAvIma3LAfjHBrb7BR3Z1ajg1SD81E_QMQSkp-8fV4bOkMfk_hQHup31b0mrfCxBd8Eroo8v84tQxjxRnhzy70t4GBNcGwVH8QG97giul_cDTih6Ypc7dvRnIKog-WXTR_8ZfEgUq4swwm5NPzL7EgBfIIp8z7MMFVoGE5OzXOmABt60XMurDQaXCmUAwYYKnm4ntze11LAbpA"
              alt="Avatar"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <button type="button" className="px-6 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full font-medium hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm">
            Change Avatar
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest pl-1">First Name</label>
              <input id="firstName" name="firstName" aria-label="First Name" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest pl-1">Last Name</label>
              <input id="lastName" name="lastName" aria-label="Last Name" type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest pl-1">Email Address</label>
            <input id="email" name="email" aria-label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
          </div>
          <div className="space-y-2">
            <label htmlFor="bio" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest pl-1">Bio</label>
            <textarea id="bio" name="bio" aria-label="Bio" value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none" />
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section id="notifications" className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-3xl p-8 md:p-10 border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-colors duration-300">
        <div className="mb-8">
          <h3 className="font-serif text-[28px] text-zinc-900 dark:text-zinc-100 leading-tight mb-1">Notifications</h3>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400">Control how you receive alerts.</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="text-[16px] font-medium text-zinc-900 dark:text-zinc-100">Email Alerts</p>
              <p className="text-[14px] text-zinc-500 dark:text-zinc-400">Receive daily summary emails.</p>
            </div>
            <button 
              type="button"
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                emailAlerts ? "bg-zinc-900 dark:bg-primary" : "bg-zinc-200 dark:bg-zinc-700"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                emailAlerts ? "translate-x-6.5" : "translate-x-0.5"
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="text-[16px] font-medium text-zinc-900 dark:text-zinc-100">Order Notifications</p>
              <p className="text-[14px] text-zinc-500 dark:text-zinc-400">Get notified for new orders instantly.</p>
            </div>
            <button 
              type="button"
              onClick={() => setOrderNotifs(!orderNotifs)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                orderNotifs ? "bg-zinc-900 dark:bg-primary" : "bg-zinc-200 dark:bg-zinc-700"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                orderNotifs ? "translate-x-6.5" : "translate-x-0.5"
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[16px] font-medium text-zinc-900 dark:text-zinc-100">Marketing Updates</p>
              <p className="text-[14px] text-zinc-500 dark:text-zinc-400">News about product features.</p>
            </div>
            <button 
              type="button"
              onClick={() => setMarketingUpdates(!marketingUpdates)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                marketingUpdates ? "bg-zinc-900 dark:bg-primary" : "bg-zinc-200 dark:bg-zinc-700"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                marketingUpdates ? "translate-x-6.5" : "translate-x-0.5"
              )} />
            </button>
          </div>
        </div>
      </section>

        {/* Save Action */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={savingProfile} className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-full font-medium transition-colors shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50">
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Security Section */}
      <form onSubmit={handleSaveSecurity} className="space-y-8">
        <section id="security" className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-3xl p-8 md:p-10 border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-colors duration-300">
          <div className="mb-8">
            <h3 className="font-serif text-[28px] text-zinc-900 dark:text-zinc-100 leading-tight mb-1">Security</h3>
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400">Manage your login credentials.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest pl-1">Admin Username</label>
              <input id="username" name="username" aria-label="Admin Username" type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
            </div>
            
            <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <label htmlFor="currentPassword" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest pl-1">Current Password (Required)</label>
              <input id="currentPassword" name="currentPassword" aria-label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest pl-1">New Password (Optional)</label>
                <input id="newPassword" name="newPassword" aria-label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest pl-1">Confirm New Password</label>
                <input id="confirmPassword" name="confirmPassword" aria-label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
              </div>
            </div>
          </div>
        </section>

        {/* Save Action for Security */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={savingSecurity} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-full font-medium transition-colors shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50">
            {savingSecurity ? "Updating Security..." : "Update Security Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
