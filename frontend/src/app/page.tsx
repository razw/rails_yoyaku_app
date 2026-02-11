"use client";

import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { DateSelector } from "@/components/DateSelector";
import { SpaceCard } from "@/components/SpaceCard";
import { TimelineSchedule } from "@/components/TimelineSchedule";
import { homeApi } from "@/lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { HomeResponse } from "@/types";

export default function Home() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadHomeData();
    }
  }, [user, selectedDate]);

  const loadHomeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      const data = await homeApi.getHomeData({ date: dateString });
      setHomeData(data);
    } catch (err) {
      console.error('Failed to load home data:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSpace = (spaceId: number) => {
    // TODO: Navigate to event creation page with pre-selected space
    console.log('Book space:', spaceId);
  };

  const handleEventClick = (eventId: number) => {
    // TODO: Navigate to event detail page
    console.log('View event:', eventId);
  };

  const handleTimeSlotClick = (startTime: Date) => {
    // TODO: Navigate to event creation page with pre-selected time
    console.log('Create event at:', startTime);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              施設予約アプリ
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              スペースの空き状況を確認して、簡単に予約できます
            </p>

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
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Sub Header with Date Selector and Book Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            <button
              onClick={() => handleBookSpace(0)}
              className="px-6 py-2 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              ＋予約する
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {homeData && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Spaces (2/3 width) */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                スペース一覧
              </h2>
              {homeData.spaces.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">スペースがありません</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {homeData.spaces.map((space) => (
                    <SpaceCard
                      key={space.id}
                      space={space}
                      onBookSpace={handleBookSpace}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Timeline Schedule (1/3 width) */}
            <div className="lg:col-span-1">
              <TimelineSchedule
                events={homeData.timeline_events}
                selectedDate={selectedDate}
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
