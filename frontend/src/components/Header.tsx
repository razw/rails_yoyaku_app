"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Error is handled by context
    }
  };

  return (
    <header className="bg-gradient-to-r from-teal-600 to-emerald-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-white hover:text-teal-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            施設予約アプリ
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-teal-100">
                  {user.name} さん
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white border border-white/40 rounded-md hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white hover:text-teal-100 transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-teal-700 bg-white rounded-md hover:bg-teal-50 transition-colors"
                >
                  新規登録
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
