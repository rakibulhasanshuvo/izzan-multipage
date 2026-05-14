"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useAdminSidebar } from "./AdminSidebarContext";

export default function TopAppBar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useAdminSidebar();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Smarter breadcrumb logic
  let formattedName = "Dashboard";
  if (pathname === "/admin") {
    formattedName = "Overview";
  } else {
    const pageName = pathname.split("/").pop() || "Dashboard";
    formattedName = pageName === "cms" ? "CMS" : pageName.charAt(0).toUpperCase() + pageName.slice(1);
  }

  return (
    <header aria-label="Top Application Bar" className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-10 ml-0 md:ml-[260px] w-full md:w-[calc(100%-260px)] h-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl border-b border-zinc-200/50 dark:border-zinc-800 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-2.5">
        <button
          aria-label="Toggle Sidebar"
          className="md:hidden text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full p-2 mr-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <div className="text-zinc-400 font-medium tracking-widest uppercase text-[11px] hidden sm:block">Admin</div>
        <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-zinc-400 hidden sm:block">chevron_right</span>
        <div className="font-serif text-zinc-800 dark:text-zinc-100 text-lg capitalize tracking-wide">{formattedName}</div>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        {mounted && (
          <button 
            aria-label="Toggle Theme" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-zinc-400 dark:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-300 flex items-center group"
          >
            <span aria-hidden="true" className="material-symbols-outlined group-hover:scale-110 transition-transform">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        )}

        <button aria-label="User Profile" className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ml-0 md:ml-2 cursor-pointer hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 relative">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5Z6EOvrTdFYj2jxBp2kgCLuxY-wuRAOwt4AUKYz3EwVFFwDrRwW5F6R7jKNh38rfSi146wxLCmlH3Neb5PI0o7QJr2zzHDTp87l-LmnZNyH7pbTUJ7EjfhnizZD32u2FoBOuO-Q5TqdK1XRMlQQgBYTMHlaws9KxSUv2ELxyyTZI41WYpEcfEGTIEv8Q_Q6pDylg10n1ub1nbjt5FuTBsuYUF29WQNI83X01ECb_U3TY3UIeg5uJZ1hRRapg_mJrdc0RXHZxotQw"
            alt="User Profile"
            fill
            sizes="(max-width: 768px) 36px, 40px"
            className="object-cover"
          />
        </button>
      </div>
    </header>
  );
}
