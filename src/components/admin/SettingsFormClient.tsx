"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/app/(admin)/admin/actions";
import logger from "@/lib/logger";

import { AdminSettings } from "@/generated/client";

export default function SettingsFormClient({ initialSettings }: { initialSettings: AdminSettings }) {
  const router = useRouter();
  
  const [firstName, setFirstName] = useState(initialSettings?.firstName || "");
  const [lastName, setLastName] = useState(initialSettings?.lastName || "");
  const [email, setEmail] = useState(initialSettings?.email || "");
  const [bio, setBio] = useState(initialSettings?.bio || "");
  
  const [emailAlerts, setEmailAlerts] = useState(initialSettings?.emailAlerts ?? true);
  const [orderNotifs, setOrderNotifs] = useState(initialSettings?.orderNotifs ?? true);
  const [marketingUpdates, setMarketingUpdates] = useState(initialSettings?.marketingUpdates ?? false);

  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateSettings({
        firstName, lastName, email, bio, emailAlerts, orderNotifs, marketingUpdates
      });

      toast.success("Settings saved successfully.");
      router.refresh();
    } catch (error) {
      logger.error("Error updating settings:", error);
      toast.error("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Profile Section */}
      <section id="profile" className="bg-white/80 backdrop-blur-3xl rounded-3xl p-8 md:p-10 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="mb-8">
          <h3 className="font-serif text-[28px] text-zinc-900 leading-tight mb-1">Profile</h3>
          <p className="text-[15px] text-zinc-500">Update your personal information.</p>
        </div>

        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 rounded-full bg-zinc-100 overflow-hidden border-4 border-white shadow-md flex-shrink-0 relative">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYBjMwG0nbuaC6Ox9ovV4Emlpn6-VBpvR9GaxVe4Ld8vPv6v8ljiLEFNx8N8A8nPAvIma3LAfjHBrb7BR3Z1ajg1SD81E_QMQSkp-8fV4bOkMfk_hQHup31b0mrfCxBd8Eroo8v84tQxjxRnhzy70t4GBNcGwVH8QG97giul_cDTih6Ypc7dvRnIKog-WXTR_8ZfEgUq4swwm5NPzL7EgBfIIp8z7MMFVoGE5OzXOmABt60XMurDQaXCmUAwYYKnm4ntze11LAbpA"
              alt="Avatar"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <button type="button" className="px-6 py-2.5 bg-zinc-50 border border-zinc-200/80 text-zinc-700 rounded-full font-medium hover:bg-zinc-100 transition-colors shadow-sm">
            Change Avatar
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-[13px] font-medium text-zinc-700 uppercase tracking-widest pl-1">First Name</label>
              <input id="firstName" name="firstName" aria-label="First Name" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-zinc-50/50 border border-zinc-200/80 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-[13px] font-medium text-zinc-700 uppercase tracking-widest pl-1">Last Name</label>
              <input id="lastName" name="lastName" aria-label="Last Name" type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-zinc-50/50 border border-zinc-200/80 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-[13px] font-medium text-zinc-700 uppercase tracking-widest pl-1">Email Address</label>
            <input id="email" name="email" aria-label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-50/50 border border-zinc-200/80 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
          </div>
          <div className="space-y-2">
            <label htmlFor="bio" className="text-[13px] font-medium text-zinc-700 uppercase tracking-widest pl-1">Bio</label>
            <textarea id="bio" name="bio" aria-label="Bio" value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full bg-zinc-50/50 border border-zinc-200/80 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none" />
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section id="notifications" className="bg-white/80 backdrop-blur-3xl rounded-3xl p-8 md:p-10 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="mb-8">
          <h3 className="font-serif text-[28px] text-zinc-900 leading-tight mb-1">Notifications</h3>
          <p className="text-[15px] text-zinc-500">Control how you receive alerts.</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
            <div>
              <p className="text-[16px] font-medium text-zinc-900">Email Alerts</p>
              <p className="text-[14px] text-zinc-500">Receive daily summary emails.</p>
            </div>
            <button 
              type="button"
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                emailAlerts ? "bg-zinc-900" : "bg-zinc-200"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                emailAlerts ? "translate-x-6.5" : "translate-x-0.5"
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
            <div>
              <p className="text-[16px] font-medium text-zinc-900">Order Notifications</p>
              <p className="text-[14px] text-zinc-500">Get notified for new orders instantly.</p>
            </div>
            <button 
              type="button"
              onClick={() => setOrderNotifs(!orderNotifs)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                orderNotifs ? "bg-zinc-900" : "bg-zinc-200"
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
              <p className="text-[16px] font-medium text-zinc-900">Marketing Updates</p>
              <p className="text-[14px] text-zinc-500">News about product features.</p>
            </div>
            <button 
              type="button"
              onClick={() => setMarketingUpdates(!marketingUpdates)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                marketingUpdates ? "bg-zinc-900" : "bg-zinc-200"
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
        <button type="submit" disabled={saving} className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-full font-medium transition-colors shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
