"use client";

import type { SpaceWithStatus } from "@/types";

interface SpaceCardProps {
  space: SpaceWithStatus;
  onBookSpace: (spaceId: number) => void;
}

export function SpaceCard({ space, onBookSpace }: SpaceCardProps) {
  const isAvailable = space.status === 'available';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div
      className={`p-4 rounded-lg border ${
        isAvailable
          ? 'bg-white border-gray-200'
          : 'bg-gray-50 border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{space.name}</h3>
        {space.capacity && (
          <span className="text-sm text-gray-500">定員: {space.capacity}名</span>
        )}
      </div>

      {space.description && (
        <p className="text-sm text-gray-600 mb-3">{space.description}</p>
      )}

      <div className="mb-3">
        {isAvailable ? (
          <div>
            <span className="inline-block px-2 py-1 text-sm font-medium text-green-700 bg-green-100 rounded">
              空き
            </span>
            {space.next_event_at && (
              <p className="text-sm text-gray-600 mt-2">
                次の予約: {formatTime(space.next_event_at)}〜
              </p>
            )}
          </div>
        ) : (
          <div>
            <span className="inline-block px-2 py-1 text-sm font-medium text-red-700 bg-red-100 rounded">
              使用中
            </span>
            {space.occupied_until && (
              <p className="text-sm text-gray-600 mt-2">
                〜{formatTime(space.occupied_until)}まで
              </p>
            )}
            {space.current_event && (
              <p className="text-sm text-gray-600 mt-1">
                {space.current_event.name}
              </p>
            )}
          </div>
        )}
      </div>

      {isAvailable ? (
        <button
          onClick={() => onBookSpace(space.id)}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          このスペースを予約
        </button>
      ) : (
        space.next_event_at && (
          <button
            onClick={() => onBookSpace(space.id)}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            この時間以降で予約
          </button>
        )
      )}
    </div>
  );
}
