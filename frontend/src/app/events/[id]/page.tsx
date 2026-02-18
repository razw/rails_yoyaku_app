"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { TimelineSchedule } from "@/components/TimelineSchedule";
import { useAuth } from "@/contexts/AuthContext";
import { eventsApi, homeApi, ApiError } from "@/lib/api";
import type { EventResponse, HomeResponse } from "@/types";

function formatDisplayDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [eventData, setEventData] = useState<EventResponse["event"] | null>(null);
  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await eventsApi.getEvent(Number(id));
        setEventData(data.event);

        const eventDate = new Date(data.event.starts_at);
        const dateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, "0")}-${String(eventDate.getDate()).padStart(2, "0")}`;
        const home = await homeApi.getHomeData({ date: dateStr });
        setHomeData(home);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setError("イベントが見つかりません");
        } else {
          setError("データの読み込みに失敗しました");
        }
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, user]);

  const handleDelete = async () => {
    if (!eventData) return;
    setDeleting(true);
    setError(null);

    try {
      await eventsApi.deleteEvent(eventData.id);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data;
        if ("error" in data) {
          setError(data.error);
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("削除に失敗しました");
      }
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">ログインしてください</p>
        </main>
      </div>
    );
  }

  const selectedDate = eventData ? new Date(eventData.starts_at) : new Date();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">イベント詳細</h2>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {eventData && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {eventData.name}
                    </h3>
                    {eventData.status === 'pending' && (
                      <span className="inline-block text-xs px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-300 rounded-full font-medium">
                        申請中
                      </span>
                    )}
                    {eventData.status === 'approved' && (
                      <span className="inline-block text-xs px-2 py-0.5 bg-teal-100 text-teal-700 border border-teal-300 rounded-full font-medium">
                        承認済み
                      </span>
                    )}
                    {eventData.status === 'rejected' && (
                      <span className="inline-block text-xs px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-300 rounded-full font-medium">
                        却下
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">スペース</p>
                      <p className="text-gray-900">{eventData.space.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">主催者</p>
                      <p className="text-gray-900">{eventData.organizer.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">開始時刻</p>
                      <p className="text-gray-900">
                        {formatDisplayDateTime(eventData.starts_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">終了時刻</p>
                      <p className="text-gray-900">
                        {formatDisplayDateTime(eventData.ends_at)}
                      </p>
                    </div>
                  </div>

                  {eventData.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">説明</p>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {eventData.description}
                      </p>
                    </div>
                  )}

                  {eventData.is_organizer && (
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
                      >
                        削除
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/events/${id}/edit`)}
                        className="px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700"
                      >
                        編集
                      </button>
                    </div>
                  )}

                  {showDeleteConfirm && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 mb-3">
                        このイベントを削除しますか？この操作は取り消せません。
                      </p>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          disabled={deleting}
                        >
                          キャンセル
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                          disabled={deleting}
                        >
                          {deleting ? "削除中..." : "削除する"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {homeData && (
              <div className="lg:col-span-1">
                <TimelineSchedule
                  events={homeData.timeline_events}
                  spaces={homeData.spaces}
                  selectedDate={selectedDate}
                  selectedSpaceId={eventData.space.id}
                  onEventClick={(eventId) => router.push(`/events/${eventId}`)}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
