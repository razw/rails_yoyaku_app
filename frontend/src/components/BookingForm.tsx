"use client";

import { useState, useEffect } from "react";
import { ApiError } from "@/lib/api";
import type { SpaceWithStatus } from "@/types";

interface BookingFormProps {
  onSubmit: (bookingData: BookingFormData) => Promise<void>;
  onCancel: () => void;
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

export function BookingForm({
  onSubmit,
  onCancel,
  spaces,
  selectedSpace,
  selectedDate,
  selectedStartTime,
}: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    description: "",
    space_id: selectedSpace || (spaces[0]?.id || 0),
    starts_at: "",
    ends_at: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startTime = selectedStartTime || selectedDate || new Date();

    const defaultStart = new Date(startTime);
    defaultStart.setMinutes(0);
    defaultStart.setSeconds(0);
    defaultStart.setMilliseconds(0);
    if (!selectedStartTime) {
      defaultStart.setHours(defaultStart.getHours() + 1);
    }

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
  }, [selectedSpace, selectedDate, selectedStartTime, spaces]);

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
      const startDate = new Date(formData.starts_at);
      const endDate = new Date(formData.ends_at);

      if (endDate <= startDate) {
        throw new Error("終了時刻は開始時刻より後にしてください");
      }

      await onSubmit(formData);
      onCancel();
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
        setError("予約の作成に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">予約を作成</h2>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="例: チーム会議"
            />
          </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="イベントの詳細や注意事項など"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "作成中..." : "予約を作成"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
