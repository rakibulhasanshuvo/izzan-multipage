"use client";

import Link from "next/link";
import { useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isPending) return;
    setIsPending(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to subscribe. Please try again.");
      }
      toast.success("You're on the list! Your 15% off code is on its way.");
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to subscribe. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <footer className="bg-background-light dark:bg-background-dark pt-12 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300 min-h-[284px] flex flex-col justify-between">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
          <h2 className="font-display text-xl mb-2">Stay in Touch</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Email signup for 15% OFF</p>
          <form onSubmit={handleSubmit} className="flex w-full max-w-sm mx-auto md:mx-0">
            <input
              className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-gray-800 dark:text-white"
              placeholder="Email address…"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address for newsletter"
            />
            <button
              className="bg-primary text-white px-6 py-2 text-sm font-semibold tracking-wider rounded-r-full hover:bg-primary/90 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "…" : "SIGN UP"}
            </button>
          </form>
        </div>
        <div className="text-center">
          <Link href="/" className="text-5xl font-logo text-text-light dark:text-text-dark hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-3 inline-block py-3 min-h-[48px] min-w-[48px]">Izzan</Link>
        </div>
        <div className="flex flex-col md:flex-row justify-end items-center md:items-center space-y-6 md:space-y-0 md:space-x-12 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-2 text-sm">
            <Link className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-3 py-1.5 min-h-[32px] inline-flex items-center rounded" href="/contact">Support & FAQ</Link>
            <Link className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-3 py-1.5 min-h-[32px] inline-flex items-center rounded" href="/story">Our Story</Link>
            <Link className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-3 py-1.5 min-h-[32px] inline-flex items-center rounded" href="/shop">Shop</Link>
          </div>
          <div className="flex flex-col items-center md:items-end space-y-4">
            <div className="flex space-x-4">
              <Link className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-1" href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Camera size={20} />
              </Link>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center md:text-right">Payment methods</p>
              <div className="flex justify-center md:justify-end space-x-2">
                <div className="w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded text-[8px] flex items-center justify-center font-bold">VISA</div>
                <div className="w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded text-[8px] flex items-center justify-center font-bold">MC</div>
                <div className="w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded text-[8px] flex items-center justify-center font-bold">AMEX</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-primary mt-12 py-3 text-center text-white text-xs flex justify-center items-center gap-4">
        <span>www.izzan.com</span>
      </div>
    </footer>
  );
}
