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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            施設予約
          </Link>

          <nav className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  {user.admin && (
                    <span className="text-[11px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded-md font-semibold tracking-wide">
                      ADMIN
                    </span>
                  )}
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium text-white bg-gray-900 px-3.5 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
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
