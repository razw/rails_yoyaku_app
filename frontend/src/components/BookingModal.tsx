"use client";

import { useState, useEffect } from "react";
import { ApiError } from "@/lib/api";
import type { SpaceWithStatus } from "@/types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: BookingFormData) => Promise<void>;
  spaces: SpaceWithStatus[];
  selectedSpace?: number;
  selectedDate?: Date;
  selectedStartTime?: Date;
}

export interface BookingFormData {
  name: string;
  description: string;
  space_id: number;
  starts_at: string;
  ends_at: string;
}

export function BookingModal({
  isOpen,
  onClose,
  onSubmit,
  spaces,
  selectedSpace,
  selectedDate,
  selectedStartTime,
}: BookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    description: "",
    space_id: selectedSpace || (spaces[0]?.id || 0),
    starts_at: "",
    ends_at: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with selected values
  useEffect(() => {
    if (isOpen) {
      const startTime = selectedStartTime || selectedDate || new Date();

      // Set default start time to next hour
      const defaultStart = new Date(startTime);
      defaultStart.setMinutes(0);
      defaultStart.setSeconds(0);
      defaultStart.setMilliseconds(0);
      if (!selectedStartTime) {
        defaultStart.setHours(defaultStart.getHours() + 1);
      }

      // Set default end time to 1 hour after start
      const defaultEnd = new Date(defaultStart);
      defaultEnd.setHours(defaultEnd.getHours() + 1);

      setFormData({
        name: "",
        description: "",
        space_id: selectedSpace || (spaces[0]?.id || 0),
        starts_at: formatDateTimeLocal(defaultStart),
        ends_at: formatDateTimeLocal(defaultEnd),
      });
      setError(null);
    }
  }, [isOpen, selectedSpace, selectedDate, selectedStartTime, spaces]);

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate dates
      const startDate = new Date(formData.starts_at);
      const endDate = new Date(formData.ends_at);

      if (endDate <= startDate) {
        throw new Error("終了時刻は開始時刻より後にしてください");
      }

      await onSubmit(formData);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        // Extract user-friendly message from API validation errors
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
        setError("予約の作成に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">予約を作成</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                イベント名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: チーム会議"
              />
            </div>

            {/* Space Selection */}
            <div>
              <label
                htmlFor="space"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                スペース <span className="text-red-500">*</span>
              </label>
              <select
                id="space"
                required
                value={formData.space_id}
                onChange={(e) =>
                  setFormData({ ...formData, space_id: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Start Time */}
            <div>
              <label
                htmlFor="starts_at"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                開始時刻 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="starts_at"
                required
                value={formData.starts_at}
                onChange={(e) =>
                  setFormData({ ...formData, starts_at: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Time */}
            <div>
              <label
                htmlFor="ends_at"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                終了時刻 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="ends_at"
                required
                value={formData.ends_at}
                onChange={(e) =>
                  setFormData({ ...formData, ends_at: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                説明
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="イベントの詳細や注意事項など"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "作成中..." : "予約を作成"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
