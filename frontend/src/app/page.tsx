"use client";

import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { DateSelector } from "@/components/DateSelector";
import { SpaceCard } from "@/components/SpaceCard";
import { TimelineSchedule } from "@/components/TimelineSchedule";
import { BookingForm, type BookingFormData } from "@/components/BookingForm";
import { EventDetailPanel, type EventEditFormData } from "@/components/EventDetailPanel";
import { homeApi, eventsApi } from "@/lib/api";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import type { HomeResponse, TimelineEvent } from "@/types";

type LeftPanelView =
  | { kind: "spaces" }
  | { kind: "booking"; spaceId?: number; startTime?: Date }
  | { kind: "eventDetail"; event: TimelineEvent };

export default function Home() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leftPanel, setLeftPanel] = useState<LeftPanelView>({ kind: "spaces" });

  const loadHomeData = useCallback(async () => {
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
  }, [selectedDate]);

  useEffect(() => {
    if (user) {
      loadHomeData();
    }
  }, [user, loadHomeData]);

  const handleBookSpace = (spaceId: number) => {
    setLeftPanel({
      kind: "booking",
      spaceId: spaceId === 0 ? undefined : spaceId,
    });
  };

  const handleEventClick = (eventId: number) => {
    const event = homeData?.timeline_events.find((e) => e.id === eventId);
    if (event) {
      setLeftPanel({ kind: "eventDetail", event });
    }
  };

  const handleTimeSlotClick = (startTime: Date) => {
    setLeftPanel({ kind: "booking", startTime });
  };

  const handleBackToSpaces = () => {
    setLeftPanel({ kind: "spaces" });
  };

  const handleCreateBooking = async (bookingData: BookingFormData) => {
    await eventsApi.createEvent({
      event: {
        name: bookingData.name,
        description: bookingData.description || null,
        starts_at: bookingData.starts_at,
        ends_at: bookingData.ends_at,
        space_id: bookingData.space_id,
      },
    });
    await loadHomeData();
  };

  const handleUpdateEvent = async (eventId: number, data: EventEditFormData) => {
    await eventsApi.updateEvent(eventId, {
      event: {
        name: data.name,
        description: data.description || null,
        starts_at: data.starts_at,
        ends_at: data.ends_at,
        space_id: data.space_id,
      },
    });
    await loadHomeData();
  };

  const handleDeleteEvent = async (eventId: number) => {
    await eventsApi.deleteEvent(eventId);
    await loadHomeData();
  };

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
    await loadHomeData();
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

      {/* Sub Header with Date Selector and Book Button */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            <button
              onClick={() => handleBookSpace(0)}
              className="px-6 py-2 text-base font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-md hover:from-teal-600 hover:to-emerald-600 shadow-md transition-all"
            >
              ＋予約する
            </button>
          </div>
        </div>
      </div>

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
            {/* Left Column: Spaces / Booking Form / Event Detail (2/3 width) */}
            <div className="lg:col-span-2">
              {leftPanel.kind === "spaces" && (
                <>
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
                </>
              )}

              {leftPanel.kind === "booking" && (
                <BookingForm
                  onSubmit={handleCreateBooking}
                  onCancel={handleBackToSpaces}
                  spaces={homeData.spaces}
                  selectedSpace={leftPanel.spaceId}
                  selectedDate={selectedDate}
                  selectedStartTime={leftPanel.startTime}
                />
              )}

              {leftPanel.kind === "eventDetail" && (
                <EventDetailPanel
                  event={leftPanel.event}
                  onBack={handleBackToSpaces}
                  onUpdate={handleUpdateEvent}
                  onDelete={handleDeleteEvent}
                  spaces={homeData.spaces}
                />
              )}
            </div>

            {/* Right Column: Timeline Schedule (1/3 width) */}
            <div className="lg:col-span-1">
              <TimelineSchedule
                events={homeData.timeline_events}
                selectedDate={selectedDate}
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
                onEventMove={handleMoveEvent}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
