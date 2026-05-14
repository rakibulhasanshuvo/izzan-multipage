"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateCMSContent } from "@/app/(admin)/admin/actions";

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
      initialized[sectionName] = items.map(item => {
        const isMediaField = item.key.includes('_img') || item.key.includes('_video') || item.key.includes('_poster') || item.key.includes('_url');
        return {
          ...item,
          isLongText: item.value.length > 100 && !isMediaField
        };
      });
    }
    return initialized;
  });
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);

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
      console.error("Error updating CMS data:", error);
    } finally {
      setIsSaving(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: string, key: string, itemId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(itemId);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      handleValueChange(section, key, data.url);
      await updateCMSContent(itemId, data.url);
      toast.success("File uploaded and saved successfully!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error uploading file");
    } finally {
      setIsUploading(null);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(sections).map(([sectionName, items]) => (
        <div key={sectionName} className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-3xl border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-colors duration-300">
          <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-serif text-[28px] text-zinc-900 dark:text-zinc-100 capitalize">{sectionName} Section</h3>
          </div>
          <div className="p-8 space-y-8">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <div className="flex justify-between items-start mb-2">
                  <label htmlFor={item.key} className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">{item.key.replace(/_/g, " ")}</label>
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
                    className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none"
                  />
                ) : (
                  <div className="relative group/upload">
                    <input
                      id={item.key}
                      type="text"
                      value={item.value}
                      onChange={(e) => handleValueChange(sectionName, item.key, e.target.value)}
                      className={`w-full bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-[15px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all ${
                        (item.key.includes('_img') || item.key.includes('_video') || item.key.includes('_poster') || item.key.includes('_url')) ? "pr-24" : ""
                      }`}
                    />
                    {(item.key.includes('_img') || item.key.includes('_video') || item.key.includes('_poster') || item.key.includes('_url')) && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <label className="cursor-pointer bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors flex items-center gap-1 shadow-sm">
                          {isUploading === item.id ? (
                            <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
                          ) : (
                            <span className="material-symbols-outlined text-[14px]">upload</span>
                          )}
                          Upload
                          <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, sectionName, item.key, item.id)} disabled={isUploading === item.id} />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
