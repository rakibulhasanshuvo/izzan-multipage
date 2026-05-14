"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useAdminSidebar } from "./AdminSidebarContext";

const NAV_ITEMS = [
  { name: "Overview", href: "/admin", icon: "dashboard" },
  { name: "Products", href: "/admin/products", icon: "inventory_2" },
  { name: "Orders", href: "/admin/orders", icon: "shopping_cart" },
  { name: "Content CMS", href: "/admin/cms", icon: "article" },
  { name: "Customers", href: "/admin/customers", icon: "group" },
  { name: "Settings", href: "/admin/settings", icon: "settings" },
];

export default function SideNavBar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useAdminSidebar();

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/50 dark:bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav
        aria-label="Sidebar Navigation"
        className={cn(
          "fixed left-0 top-0 h-full flex flex-col py-8 w-[260px] border-r border-zinc-800/10 dark:border-zinc-800 shadow-[4px_0_24px_rgba(0,0,0,0.02)] bg-white/95 md:bg-white/80 dark:bg-zinc-950/95 dark:md:bg-zinc-950/80 backdrop-blur-2xl z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="px-8 mb-xl flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-serif italic font-bold shadow-lg shadow-primary/20">
                A
              </div>
              <h1 className="font-serif italic text-2xl text-zinc-900 dark:text-zinc-100 tracking-tight">Izzan Admin</h1>
            </div>
            <p className="font-body-sm text-[12px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest pl-[52px]">Luxe Studio</p>
          </div>
          <button
            className="md:hidden text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 focus:outline-none"
            onClick={() => setIsOpen(false)}
            aria-label="Close Sidebar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <ul className="flex flex-col flex-1 w-full mt-6 px-6 space-y-2">

{NAV_ITEMS.map((item) => {
            // Exact match for overview, or starts with for others
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <li key={item.name} className="">
                <Link
                  aria-current={isActive ? "page" : undefined}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-2xl font-serif font-medium tracking-wide transition-all duration-300 group",
                    isActive
                      ? "bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100 border border-transparent"
                  )}
                >
                  <span aria-hidden="true" className={cn(
                    "material-symbols-outlined mr-4 transition-transform duration-300",
                    !isActive && "group-hover:scale-110",
                    isActive && "text-primary"
                  )}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              </li>
            );
          })}

            <li className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="w-full flex items-center px-4 py-3 rounded-2xl font-serif font-medium tracking-wide transition-all duration-300 group text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 border border-transparent"
                >
                  <span aria-hidden="true" className="material-symbols-outlined mr-4 transition-transform duration-300 group-hover:scale-110">
                    logout
                  </span>
                  Sign Out
                </button>
            </li>
        </ul>
      </nav>
    </>
  );
}
