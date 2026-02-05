"use client";

import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            予約アプリへようこそ
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            簡単に予約を管理できるアプリケーションです
          </p>

          {user ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                こんにちは、{user.name} さん
              </h2>
              <p className="text-gray-600">
                ログイン中です
              </p>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <Link
                href="/login"
                className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                新規登録
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
