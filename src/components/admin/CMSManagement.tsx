"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateCMSContent } from "@/app/(admin)/admin/actions";
import logger from "@/lib/logger";

type CMSItem = {
  id: string;
  key: string;
  value: string;
  section: string;
  isLongText?: boolean;
};

interface CMSManagementProps {
  initialSections: Record<string, CMSItem[]>;
}

export default function CMSManagement({ initialSections }: CMSManagementProps) {
  const router = useRouter();
  const [sections, setSections] = useState(() => {
    const initialized: Record<string, CMSItem[]> = {};
    for (const [sectionName, items] of Object.entries(initialSections)) {
      initialized[sectionName] = items.map(item => ({
        ...item,
        isLongText: item.value.length > 100
      }));
    }
    return initialized;
  });
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const handleValueChange = (section: string, key: string, newValue: string) => {
    setSections((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.key === key ? { ...item, value: newValue } : item
      ),
    }));
  };

  const handleSave = async (item: CMSItem) => {
    setIsSaving(item.id);
    try {
      await updateCMSContent(item.id, item.value);

      toast.success(`Updated ${item.key}`);
      router.refresh();
    } catch (error) {
      toast.error("Error updating content");
      logger.error("Error updating CMS data:", error);
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(sections).map(([sectionName, items]) => (
        <div key={sectionName} className="bg-white/80 backdrop-blur-3xl rounded-3xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-100">
            <h3 className="font-serif text-[28px] text-zinc-900 capitalize">{sectionName} Section</h3>
          </div>
          <div className="p-8 space-y-8">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <div className="flex justify-between items-start mb-2">
                  <label htmlFor={item.key} className="text-[12px] font-semibold text-zinc-700 uppercase tracking-widest">{item.key.replace(/_/g, " ")}</label>
                  <button
                    aria-label={`Save ${item.key.replace(/_/g, " ")}`}
                    onClick={() => handleSave(item)}
                    disabled={isSaving === item.id}
                    className="text-[12px] font-medium text-primary hover:text-primary-dark disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    {isSaving === item.id ? (
                      <span className="material-symbols-outlined animate-spin text-[16px]" aria-hidden="true">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">save</span>
                    )}
                    Save Changes
                  </button>
                </div>
                {item.isLongText ? (
                  <textarea
                    id={item.key}
                    value={item.value}
                    onChange={(e) => handleValueChange(sectionName, item.key, e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-50/50 border border-zinc-200/80 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none"
                  />
                ) : (
                  <input
                    id={item.key}
                    type="text"
                    value={item.value}
                    onChange={(e) => handleValueChange(sectionName, item.key, e.target.value)}
                    className="w-full bg-zinc-50/50 border border-zinc-200/80 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
