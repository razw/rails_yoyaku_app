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
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-150">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{space.name}</h3>
          {space.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{space.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {space.capacity && (
            <span className="text-xs text-gray-400 tabular-nums">{space.capacity}名</span>
          )}
          <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
            isAvailable
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {isAvailable ? '空き' : '使用中'}
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-4 min-h-[1.25rem]">
        {isAvailable ? (
          space.next_event_at && (
            <span>次の予約: {formatTime(space.next_event_at)}〜</span>
          )
        ) : (
          <span>
            {space.occupied_until && `〜${formatTime(space.occupied_until)}まで`}
            {space.current_event && ` · ${space.current_event.name}`}
          </span>
        )}
      </div>

      {isAvailable ? (
        <button
          onClick={() => onBookSpace(space.id)}
          className="w-full py-2 text-sm font-medium text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
        >
          このスペースを予約
        </button>
      ) : (
        space.next_event_at ? (
          <button
            onClick={() => onBookSpace(space.id)}
            className="w-full py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            この時間以降で予約
          </button>
        ) : (
          <div className="w-full py-2 text-sm text-center text-gray-300">予約不可</div>
        )
      )}
    </div>
  );
}
