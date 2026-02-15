"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { Header } from "@/components/Header";
import { BookingForm, type BookingFormData } from "@/components/BookingForm";
import { TimelineSchedule } from "@/components/TimelineSchedule";
import { useAuth } from "@/contexts/AuthContext";
import { homeApi, eventsApi } from "@/lib/api";
import type { HomeResponse } from "@/types";

function BookingContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const spaceIdParam = searchParams.get("spaceId");
  const dateParam = searchParams.get("date");
  const startTimeParam = searchParams.get("startTime");

  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const initialSpaceId = spaceIdParam ? Number(spaceIdParam) : undefined;
  const [currentSpaceId, setCurrentSpaceId] = useState<number | undefined>(initialSpaceId);
  const selectedDate = useMemo(() => dateParam ? new Date(dateParam) : new Date(), [dateParam]);
  const selectedStartTime = useMemo(() => startTimeParam ? new Date(startTimeParam) : undefined, [startTimeParam]);

  const dateString = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homeApi.getHomeData({ date: dateString });
      setHomeData(data);
    } catch (err) {
      console.error("Failed to load home data:", err);
    } finally {
      setLoading(false);
    }
  }, [dateString]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      loadHomeData();
    }
  }, [user, authLoading, router, loadHomeData]);

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
  };

  const handleCancel = () => {
    router.push("/");
  };

  if (authLoading || loading || !homeData) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  const handleSpaceChange = (spaceId: number) => {
    setCurrentSpaceId(spaceId);
  };

  // noop for read-only timeline
  const noop = () => {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <BookingForm
          onSubmit={handleCreateBooking}
          onCancel={handleCancel}
          spaces={homeData.spaces}
          selectedSpace={initialSpaceId}
          selectedDate={selectedDate}
          selectedStartTime={selectedStartTime}
          onSpaceChange={handleSpaceChange}
        />
      </div>
      <div className="lg:col-span-1">
        {currentSpaceId !== undefined ? (
          <TimelineSchedule
            events={homeData.timeline_events}
            spaces={homeData.spaces}
            selectedDate={selectedDate}
            selectedSpaceId={currentSpaceId}
            onEventClick={noop}
            readOnly
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
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          }
        >
          <BookingContent />
        </Suspense>
      </main>
    </div>
  );
}
