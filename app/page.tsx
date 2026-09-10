"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // තත්පර 2කට පසු ස්වයංක්‍රීයව /login පිටුවට navigate වේ
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 via-sky-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Container Card */}
      <main className="relative z-10 w-full max-w-md mx-4 p-8 sm:p-10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-2xl shadow-zinc-200/50 dark:shadow-none flex flex-col items-center text-center">
        
        {/* Brand Icon / Logo */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-50 dark:ring-indigo-950/50">
            {/* Book/LMS Icon SVG */}
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          {/* Subtle pulse ring around icon */}
          <span className="absolute -inset-1 rounded-2xl bg-indigo-500/20 animate-ping pointer-events-none" />
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          LMS Portal
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
          Welcome back. Preparing your learning environment...
        </p>

        {/* Loading Indicator & Progress Ring */}
        <div className="mt-8 flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-medium text-zinc-600 dark:text-zinc-300">
          <svg
            className="animate-spin h-4 w-4 text-indigo-600 dark:text-indigo-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          Redirecting to login...
        </div>

        {/* Manual Fallback Action */}
        <div className="mt-6">
          <Link
            href="/login"
            className="text-xs text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 underline underline-offset-4"
          >
            Click here if you aren't redirected automatically
          </Link>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="absolute bottom-6 text-xs text-zinc-400 dark:text-zinc-600 tracking-wider font-mono">
        SECURE AUTHENTICATION • LMS
      </footer>
    </div>
  );
}