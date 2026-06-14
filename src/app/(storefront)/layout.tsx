import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNavbar } from "@/components/BottomNavbar";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-16 md:pb-0 relative">
        {children}
      </main>
      <Footer />
      <BottomNavbar />
    </>
  );
}
