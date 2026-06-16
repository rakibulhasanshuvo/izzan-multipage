"use client";

import Link from "next/link";
import { useState } from "react";
import { Camera, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Subscribed!", {
        description: "Welcome to the Izzan family. Check your inbox for your 15% OFF code.",
      });
      setEmail("");
    }
  };

  return (
    <footer className="bg-background-light dark:bg-background-dark pt-12 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
          <h2 className="font-display text-xl mb-2">Stay in Touch</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Email signup for 15% OFF</p>
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
              className="bg-primary text-white px-6 py-2 text-sm font-semibold tracking-wider rounded-r-full hover:bg-opacity-90 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              type="submit"
            >
              SIGN UP
            </button>
          </form>
        </div>
        <div className="text-center">
          <Link href="/" className="text-5xl font-logo text-text-light dark:text-text-dark hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-2">Izzan</Link>
        </div>
        <div className="flex flex-col md:flex-row justify-end items-center md:items-center space-y-6 md:space-y-0 md:space-x-12 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-2 text-sm">
            <Link className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-2 rounded" href="/contact">Support & FAQ</Link>
            <Link className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-2 rounded" href="/story">Our Story</Link>
            <Link className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-2 rounded" href="/shop">Shop</Link>
          </div>
          <div className="flex flex-col items-center md:items-end space-y-4">
            <div className="flex space-x-4">
              <Link className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-1" href="#" aria-label="Instagram">
                <Camera size={20} />
              </Link>
              <Link className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-1" href="#" aria-label="Chat">
                <MessageCircle size={20} />
              </Link>
              <Link className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-1" href="#" aria-label="Share">
                <Share2 size={20} />
              </Link>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-xs text-gray-500 mb-2 text-center md:text-right">Payment methods</p>
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
        <span className="opacity-30">|</span>
        <Link href="/admin" className="hover:underline">Admin Dashboard</Link>
      </div>
    </footer>
  );
}
