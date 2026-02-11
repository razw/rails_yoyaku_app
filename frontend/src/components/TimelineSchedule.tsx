"use client";

import type { TimelineEvent } from "@/types";
import { useState, useMemo } from "react";

interface TimelineScheduleProps {
  events: TimelineEvent[];
  selectedDate: Date;
  onEventClick: (eventId: number) => void;
  onTimeSlotClick?: (startTime: Date) => void;
}

interface TimeSlot {
  hour: number;
  minute: number;
  time: string;
}

interface EventPosition {
  event: TimelineEvent;
  top: number;
  height: number;
  lane: number;
}

export function TimelineSchedule({
  events,
  selectedDate,
  onEventClick,
  onTimeSlotClick
}: TimelineScheduleProps) {
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

  // Generate time slots (08:00 - 22:00, 30min intervals)
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 22 && minute > 0) break; // Stop at 22:00
        slots.push({
          hour,
          minute,
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        });
      }
    }
    return slots;
  }, []);

  // Filter events based on selected filter
  const filteredEvents = useMemo(() => {
    if (filter === 'mine') {
      return events.filter(event => event.user_involved);
    }
    return events;
  }, [events, filter]);

  // Calculate event positions and handle overlaps
  const eventPositions = useMemo((): EventPosition[] => {
    const SLOT_HEIGHT = 60; // pixels per 30min slot
    const START_HOUR = 8;

    const positions: EventPosition[] = [];
    const lanes: { startMinute: number; endMinute: number }[][] = [[]];

    filteredEvents.forEach(event => {
      const start = new Date(event.starts_at);
      const end = new Date(event.ends_at);

      // Calculate minutes from 08:00
      const startMinute = (start.getHours() - START_HOUR) * 60 + start.getMinutes();
      const endMinute = (end.getHours() - START_HOUR) * 60 + end.getMinutes();

      // Skip events outside business hours or on different days
      if (startMinute < 0 || start.toDateString() !== selectedDate.toDateString()) {
        return;
      }

      const top = (startMinute / 30) * SLOT_HEIGHT;
      const height = ((endMinute - startMinute) / 30) * SLOT_HEIGHT;

      // Find available lane
      let assignedLane = 0;
      for (let i = 0; i < lanes.length; i++) {
        const hasOverlap = lanes[i].some(
          occupied => !(endMinute <= occupied.startMinute || startMinute >= occupied.endMinute)
        );
        if (!hasOverlap) {
          assignedLane = i;
          break;
        }
      }

      // Create new lane if needed
      if (assignedLane === lanes.length - 1 && lanes[assignedLane].length > 0) {
        const hasOverlap = lanes[assignedLane].some(
          occupied => !(endMinute <= occupied.startMinute || startMinute >= occupied.endMinute)
        );
        if (hasOverlap) {
          lanes.push([]);
          assignedLane = lanes.length - 1;
        }
      }

      lanes[assignedLane].push({ startMinute, endMinute });

      positions.push({
        event,
        top,
        height: Math.max(height, 40), // Minimum height
        lane: assignedLane
      });
    });

    return positions;
  }, [filteredEvents, selectedDate]);

  const totalLanes = useMemo(() => {
    return Math.max(1, ...eventPositions.map(p => p.lane + 1));
  }, [eventPositions]);

  const handleTimeSlotClick = (hour: number, minute: number) => {
    if (onTimeSlotClick) {
      const clickedTime = new Date(selectedDate);
      clickedTime.setHours(hour, minute, 0, 0);
      onTimeSlotClick(clickedTime);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-900">
            スケジュール
          </h2>
          <div className="text-sm text-gray-600">
            {selectedDate.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short'
            })}
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('mine')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'mine'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            自分が参加
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative p-4">
        <div className="flex">
          {/* Time labels */}
          <div className="flex-shrink-0 w-16 pr-2">
            {timeSlots.map((slot) => (
              <div
                key={slot.time}
                className="h-[60px] text-xs text-gray-500 text-right pr-2"
              >
                {slot.time}
              </div>
            ))}
          </div>

          {/* Timeline grid and events */}
          <div className="flex-1 relative border-l border-gray-200">
            {/* Time slot grid */}
            {timeSlots.map((slot, index) => (
              <div
                key={slot.time}
                onClick={() => handleTimeSlotClick(slot.hour, slot.minute)}
                className={`h-[60px] border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}
              />
            ))}

            {/* Event blocks */}
            <div className="absolute inset-0 pointer-events-none">
              {eventPositions.map(({ event, top, height, lane }) => {
                const laneWidth = 100 / totalLanes;
                const left = lane * laneWidth;

                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event.id)}
                    className={`absolute pointer-events-auto cursor-pointer transition-all hover:shadow-lg ${
                      event.user_involved
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-100 border border-gray-300'
                    }`}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      left: `${left}%`,
                      width: `${laneWidth}%`,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    <div className="text-xs font-semibold truncate">
                      {event.name}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {event.space.name}
                    </div>
                    {event.is_organizer && (
                      <span className="inline-block text-[10px] px-1 bg-blue-600 text-white rounded mt-1">
                        主催
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {filter === 'mine' ? '参加予定のイベントはありません' : 'イベントはありません'}
          </div>
        )}
      </div>
    </div>
  );
}
