"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, type LoginFormValues } from "@/lib/validation";

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError("");

    try {
      const res = await signIn("credentials", {
        ...values,
        redirect: false,
      });

      if (res?.error) {
        // "CredentialsSignin" = authorize returned null (bad credentials).
        // Any other value is a server-thrown message (e.g. rate limiting)
        // forwarded verbatim by NextAuth v4 — safe to display.
        setError(
          res.error === "CredentialsSignin"
            ? "Invalid username or password"
            : res.error
        );
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
          <h1 className="font-serif text-[32px] text-zinc-900 leading-tight mb-2">Welcome Back</h1>
          <p className="text-[15px] text-zinc-600">Sign in to the admin dashboard.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <label className="text-[13px] font-semibold text-zinc-700 uppercase tracking-widest block" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              aria-invalid={!!errors.username}
              {...register("username")}
              className="w-full bg-zinc-50 border border-zinc-200/50 rounded-xl px-4 py-3 text-[15px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="text-xs text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-zinc-700 uppercase tracking-widest block" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
              className="w-full bg-zinc-50 border border-zinc-200/50 rounded-xl px-4 py-3 text-[15px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl px-6 py-4 text-[15px] font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-4"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
