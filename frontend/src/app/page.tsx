"use client";

import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { DateSelector } from "@/components/DateSelector";
import { SpaceCard } from "@/components/SpaceCard";
import { TimelineSchedule } from "@/components/TimelineSchedule";
import { homeApi, eventsApi } from "@/lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import type { HomeResponse } from "@/types";

function formatDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending:           { label: '申請中',           className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  approved:          { label: '承認済み',          className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  rejected:          { label: '却下',              className: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
  cancel_requested:  { label: 'キャンセル申請中',  className: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' },
  cancelled:         { label: 'キャンセル済み',    className: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function AdminTable({
  title,
  accentClass,
  rows,
  onRowClick,
  showStatus = false,
}: {
  title: string;
  accentClass: string;
  rows: Array<{ id: number; name: string; starts_at: string; ends_at: string; space: { name: string }; organizer: { id: number; name: string }; status: string }>;
  onRowClick: (id: number) => void;
  showStatus?: boolean;
}) {
  const fmtDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const fmtTime = (d: Date) =>
    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`w-1.5 h-1.5 rounded-full ${accentClass}`} />
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
        <span className="text-xs text-gray-400 font-medium tabular-nums">{rows.length}</span>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">名称</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide hidden sm:table-cell">日時</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide hidden md:table-cell">スペース</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">申請者</th>
              {showStatus && <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">状態</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(event => {
              const start = new Date(event.starts_at);
              const end = new Date(event.ends_at);
              return (
                <tr
                  key={event.id}
                  onClick={() => onRowClick(event.id)}
                  className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{event.name}</td>
                  <td className="px-4 py-3 text-gray-500 tabular-nums hidden sm:table-cell">
                    {fmtDate(start)} {fmtTime(start)}–{fmtTime(end)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{event.space.name}</td>
                  <td className="px-4 py-3 text-gray-500">{event.organizer.name}</td>
                  {showStatus && (
                    <td className="px-4 py-3">
                      <StatusBadge status={event.status} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HomeContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const [year, month, day] = dateParam.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  });

  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(() => {
    const spaceParam = searchParams.get('spaceId');
    return spaceParam ? Number(spaceParam) : null;
  });

  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await homeApi.getHomeData({ date: formatDateParam(date) });
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
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', formatDateParam(date));
    router.replace(`/?${params.toString()}`);
  };

  const handleSpaceChange = (spaceId: number | null) => {
    setSelectedSpaceId(spaceId);
    const params = new URLSearchParams(searchParams.toString());
    if (spaceId !== null) {
      params.set('spaceId', String(spaceId));
    } else {
      params.delete('spaceId');
    }
    router.replace(`/?${params.toString()}`);
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex flex-col items-center justify-center px-4 py-24">
          <div className="text-center max-w-xl">
            <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
              施設予約
            </h1>
            <p className="text-base text-gray-500 mb-8 leading-relaxed">
              スペースの空き状況をリアルタイムで確認し、<br className="hidden sm:inline" />かんたんに予約できるサービスです。
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-700 transition-colors"
              >
                無料で始める →
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const fmtDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const fmtTime = (d: Date) =>
    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <DateSelector
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
              {homeData && (
                <select
                  value={selectedSpaceId ?? ''}
                  onChange={(e) => handleSpaceChange(e.target.value ? Number(e.target.value) : null)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 bg-white text-gray-700"
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
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              予約する
            </button>
          </div>
        </div>
      </div>

      {/* Admin: Pending Events */}
      {homeData && !loading && user.admin && homeData.pending_events.length > 0 && (
        <AdminTable
          title="承認待ち"
          accentClass="bg-amber-400"
          rows={homeData.pending_events}
          onRowClick={handleEventClick}
          showStatus
        />
      )}

      {/* Admin: Cancel Requested Events */}
      {homeData && !loading && user.admin && homeData.cancel_requested_events.length > 0 && (
        <AdminTable
          title="キャンセル申請中"
          accentClass="bg-orange-400"
          rows={homeData.cancel_requested_events}
          onRowClick={handleEventClick}
        />
      )}

      {/* My Events */}
      {homeData && !loading && homeData.my_events.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">自分の予約</h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">名称</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide hidden sm:table-cell">日時</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide hidden md:table-cell">スペース</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">状態</th>
                </tr>
              </thead>
              <tbody>
                {homeData.my_events.map(event => {
                  const start = new Date(event.starts_at);
                  const end = new Date(event.ends_at);
                  return (
                    <tr
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{event.name}</td>
                      <td className="px-4 py-3 text-gray-500 tabular-nums hidden sm:table-cell">
                        {fmtDate(start)} {fmtTime(start)}–{fmtTime(end)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{event.space.name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={event.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl mb-5">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {homeData && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Spaces */}
            <div className="lg:col-span-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                スペース一覧
              </h2>
              {homeData.spaces.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                  <p className="text-sm text-gray-400">スペースがありません</p>
                </div>
              ) : (
                <div className="grid gap-3">
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

            {/* Right Column: Timeline */}
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
                  isAdmin={user.admin}
                />
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">
                    スペースを選択すると<br />タイムラインが表示されます
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

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
