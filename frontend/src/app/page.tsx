"use client";

import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { DateSelector } from "@/components/DateSelector";
import { SpaceCard } from "@/components/SpaceCard";
import { TimelineSchedule } from "@/components/TimelineSchedule";
import { homeApi, eventsApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import type { HomeResponse } from "@/types";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      const data = await homeApi.getHomeData({ date: dateString });
      setHomeData(data);
    } catch (err) {
      console.error('Failed to load home data:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadHomeData(selectedDate);
    }
  }, [user, selectedDate, loadHomeData]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const formatDateParam = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleBookSpace = (spaceId: number) => {
    const params = new URLSearchParams();
    if (spaceId !== 0) {
      params.set("spaceId", String(spaceId));
    } else if (selectedSpaceId !== null) {
      params.set("spaceId", String(selectedSpaceId));
    }
    params.set("date", formatDateParam(selectedDate));
    const query = params.toString();
    router.push(`/booking${query ? `?${query}` : ""}`);
  };

  const handleEventClick = (eventId: number) => {
    router.push(`/events/${eventId}`);
  };

  const handleTimeSlotClick = (startTime: Date) => {
    const params = new URLSearchParams();
    if (selectedSpaceId !== null) {
      params.set("spaceId", String(selectedSpaceId));
    }
    params.set("startTime", startTime.toISOString());
    router.push(`/booking?${params.toString()}`);
  };

  const reloadData = useCallback(() => {
    return loadHomeData(selectedDate);
  }, [selectedDate, loadHomeData]);

  const handleMoveEvent = async (eventId: number, newStartsAt: string, newEndsAt: string) => {
    const event = homeData?.timeline_events.find((e) => e.id === eventId);
    if (!event) return;
    await eventsApi.updateEvent(eventId, {
      event: {
        name: event.name,
        description: event.description,
        starts_at: newStartsAt,
        ends_at: newEndsAt,
        space_id: event.space.id,
      },
    });
    await reloadData();
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="glass-card rounded-2xl p-12 max-w-2xl mx-auto shadow-lg">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                施設予約アプリ
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                スペースの空き状況を確認して、簡単に予約できます
              </p>

              <div className="flex justify-center gap-4">
                <Link
                  href="/login"
                  className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-md hover:from-teal-600 hover:to-emerald-600 shadow-md transition-all"
                >
                  新規登録
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Sub Header with Date Selector, Space Selector, and Book Button */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <DateSelector
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />

              {homeData && (
                <select
                  value={selectedSpaceId ?? ''}
                  onChange={(e) => setSelectedSpaceId(e.target.value ? Number(e.target.value) : null)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">スペースを選択</option>
                  {homeData.spaces.map((space) => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={() => handleBookSpace(0)}
              className="px-6 py-2 text-base font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-md hover:from-teal-600 hover:to-emerald-600 shadow-md transition-all"
            >
              ＋予約する
            </button>
          </div>
        </div>
      </div>

      {/* My Events Table */}
      {homeData && !loading && homeData.my_events.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-teal-500 rounded-full"></span>
            自分の予約
          </h2>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">イベント名</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">日時</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">スペース</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {homeData.my_events.map(event => {
                  const start = new Date(event.starts_at);
                  const end = new Date(event.ends_at);
                  const fmtDate = (d: Date) =>
                    `${d.getMonth() + 1}/${d.getDate()}`;
                  const fmtTime = (d: Date) =>
                    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                  return (
                    <tr
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-teal-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{event.name}</td>
                      <td className="px-4 py-3 text-gray-700">{fmtDate(start)} {fmtTime(start)} - {fmtTime(end)}</td>
                      <td className="px-4 py-3 text-gray-700">{event.space.name}</td>
                      <td className="px-4 py-3">
                        {event.status === 'pending' && (
                          <span className="inline-block text-xs px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-300 rounded-full font-medium">
                            申請中
                          </span>
                        )}
                        {event.status === 'approved' && (
                          <span className="inline-block text-xs px-2 py-0.5 bg-teal-100 text-teal-700 border border-teal-300 rounded-full font-medium">
                            承認済み
                          </span>
                        )}
                        {event.status === 'rejected' && (
                          <span className="inline-block text-xs px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-300 rounded-full font-medium">
                            却下
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-teal-500 rounded-full"></span>
                スペース一覧
              </h2>
              {homeData.spaces.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
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
              {selectedSpaceId !== null ? (
                <TimelineSchedule
                  events={homeData.timeline_events}
                  spaces={homeData.spaces}
                  selectedDate={selectedDate}
                  selectedSpaceId={selectedSpaceId}
                  onEventClick={handleEventClick}
                  onTimeSlotClick={handleTimeSlotClick}
                  onEventMove={handleMoveEvent}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                  <div className="text-gray-400 mb-3">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">
                    スペースを選択すると
                  </p>
                  <p className="text-gray-500 font-medium">
                    タイムラインが表示されます
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
