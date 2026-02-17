"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { TimelineSchedule } from "@/components/TimelineSchedule";
import { useAuth } from "@/contexts/AuthContext";
import { eventsApi, spacesApi, homeApi, ApiError } from "@/lib/api";
import type { Space, HomeResponse } from "@/types";

interface EventEditFormData {
  name: string;
  description: string;
  space_id: number;
  starts_at: string;
  ends_at: string;
}

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EventEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<EventEditFormData>({
    name: "",
    description: "",
    space_id: 0,
    starts_at: "",
    ends_at: "",
  });
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [eventSpaceId, setEventSpaceId] = useState<number>(0);
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [eventRes, spacesRes] = await Promise.all([
          eventsApi.getEvent(Number(id)),
          spacesApi.getSpaces(),
        ]);

        if (!eventRes.event.is_organizer) {
          router.replace(`/events/${id}`);
          return;
        }

        setSpaces(spacesRes.spaces);
        setEventSpaceId(eventRes.event.space_id);
        const startsAt = new Date(eventRes.event.starts_at);
        setEventDate(startsAt);
        setFormData({
          name: eventRes.event.name,
          description: eventRes.event.description || "",
          space_id: eventRes.event.space_id,
          starts_at: formatDateTimeLocal(startsAt),
          ends_at: formatDateTimeLocal(new Date(eventRes.event.ends_at)),
        });

        const dateStr = `${startsAt.getFullYear()}-${String(startsAt.getMonth() + 1).padStart(2, "0")}-${String(startsAt.getDate()).padStart(2, "0")}`;
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

    loadData();
  }, [id, user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const startDate = new Date(formData.starts_at);
      const endDate = new Date(formData.ends_at);

      if (endDate <= startDate) {
        throw new Error("終了時刻は開始時刻より後にしてください");
      }

      await eventsApi.updateEvent(Number(id), {
        event: {
          name: formData.name,
          description: formData.description || null,
          starts_at: formData.starts_at,
          ends_at: formData.ends_at,
          space_id: formData.space_id,
        },
      });
      router.push(`/events/${id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data;
        if ("errors" in data && Array.isArray(data.errors)) {
          setError(data.errors.join("\n"));
        } else if ("error" in data) {
          setError(data.error);
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("更新に失敗しました");
      }
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => router.push(`/events/${id}`)}
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
          <h2 className="text-2xl font-bold text-gray-900">イベントを編集</h2>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        )}

        {error && !loading && !formData.name && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && formData.name && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="edit-name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      イベント名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-space"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      スペース <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit-space"
                      required
                      value={formData.space_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          space_id: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {spaces.map((space) => (
                        <option key={space.id} value={space.id}>
                          {space.name}
                          {space.capacity && ` (定員: ${space.capacity}名)`}
                          {space.price && ` - ${space.price}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-starts_at"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      開始時刻 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="edit-starts_at"
                      required
                      value={formData.starts_at}
                      onChange={(e) =>
                        setFormData({ ...formData, starts_at: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-ends_at"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      終了時刻 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="edit-ends_at"
                      required
                      value={formData.ends_at}
                      onChange={(e) =>
                        setFormData({ ...formData, ends_at: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      説明
                    </label>
                    <textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="イベントの詳細や注意事項など"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => router.push(`/events/${id}`)}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      disabled={saving}
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "保存中..." : "保存"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {homeData && (
              <div className="lg:col-span-1">
                <TimelineSchedule
                  events={homeData.timeline_events}
                  spaces={homeData.spaces}
                  selectedDate={eventDate}
                  selectedSpaceId={eventSpaceId}
                  onEventClick={(eventId) => router.push(`/events/${eventId}`)}
                  readOnly
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
