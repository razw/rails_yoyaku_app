"use client";

import type { Event } from "@/types";
import Link from "next/link";

interface MyReservationsProps {
  events: Event[];
}

export function MyReservations({ events }: MyReservationsProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short'
      }),
      time: date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    };
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          自分の予約
        </h2>
        <p className="text-gray-500 text-center py-8">
          予約はありません
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        自分の予約
      </h2>
      <div className="space-y-3">
        {events.map((event) => {
          const start = formatDateTime(event.starts_at);
          const end = formatDateTime(event.ends_at);

          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{event.name}</h3>
                {event.is_organizer && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    主催
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-1">
                {event.space.name}
              </p>

              <p className="text-sm text-gray-500">
                {start.date} {start.time} 〜 {end.time}
              </p>

              {event.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {event.description}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
