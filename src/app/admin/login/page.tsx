"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid username or password");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="font-serif text-[32px] text-zinc-900 leading-tight mb-2">Welcome Back</h1>
          <p className="text-[15px] text-zinc-500">Sign in to the admin dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-100/50"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-zinc-500 uppercase tracking-widest block" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-zinc-50 border border-zinc-200/50 rounded-xl px-4 py-3 text-[15px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-zinc-500 uppercase tracking-widest block" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-50 border border-zinc-200/50 rounded-xl px-4 py-3 text-[15px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl px-6 py-4 text-[15px] font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-4"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
