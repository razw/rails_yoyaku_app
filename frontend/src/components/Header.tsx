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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 hover:text-gray-700"
          >
            施設予約アプリ
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-gray-600">
                  {user.name} さん
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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
