"use client";

import { useState, useEffect } from "react";
import { ApiError } from "@/lib/api";
import type { TimelineEvent, SpaceWithStatus } from "@/types";

interface EventDetailPanelProps {
  event: TimelineEvent;
  onBack: () => void;
  onUpdate: (eventId: number, data: EventEditFormData) => Promise<void>;
  onDelete: (eventId: number) => Promise<void>;
  spaces: SpaceWithStatus[];
}

export interface EventEditFormData {
  name: string;
  description: string;
  space_id: number;
  starts_at: string;
  ends_at: string;
}

export function EventDetailPanel({
  event,
  onBack,
  onUpdate,
  onDelete,
  spaces,
}: EventDetailPanelProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [formData, setFormData] = useState<EventEditFormData>({
    name: "",
    description: "",
    space_id: 0,
    starts_at: "",
    ends_at: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setMode("view");
    setError(null);
    setShowDeleteConfirm(false);
    setFormData({
      name: event.name,
      description: event.description || "",
      space_id: event.space.id,
      starts_at: formatDateTimeLocal(new Date(event.starts_at)),
      ends_at: formatDateTimeLocal(new Date(event.ends_at)),
    });
  }, [event]);

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDisplayDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
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

      await onUpdate(event.id, formData);
      onBack();
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
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await onDelete(event.id);
      onBack();
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
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={onBack}
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
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === "view" ? "イベント詳細" : "イベントを編集"}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {mode === "view" ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {event.name}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">スペース</p>
                <p className="text-gray-900">{event.space.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">主催者</p>
                <p className="text-gray-900">{event.organizer.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">開始時刻</p>
                <p className="text-gray-900">
                  {formatDisplayDateTime(event.starts_at)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">終了時刻</p>
                <p className="text-gray-900">
                  {formatDisplayDateTime(event.ends_at)}
                </p>
              </div>
            </div>

            {event.description && (
              <div>
                <p className="text-sm font-medium text-gray-500">説明</p>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {event.is_organizer && (
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
                  onClick={() => setMode("edit")}
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
                    disabled={loading}
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "削除中..." : "削除する"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
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
                onClick={() => {
                  setMode("view");
                  setError(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "保存中..." : "保存"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
