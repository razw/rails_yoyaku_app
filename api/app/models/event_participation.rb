class EventParticipation < ApplicationRecord
  belongs_to :event
  belongs_to :user

  validates :user_id, uniqueness: { scope: :event_id, message: "はすでにこのイベントに参加しています" }
end
