class Event < ApplicationRecord
  belongs_to :space
  belongs_to :user

  has_many :event_participations, dependent: :destroy
  has_many :participants, through: :event_participations, source: :user

  validates :name, presence: true
  validates :starts_at, presence: true
  validates :ends_at, presence: true
  validate :ends_at_after_starts_at
  validate :no_overlapping_events

  private

  def ends_at_after_starts_at
    return if starts_at.blank? || ends_at.blank?

    if ends_at <= starts_at
      errors.add(:ends_at, "は開始日時より後にしてください")
    end
  end

  def no_overlapping_events
    return if starts_at.blank? || ends_at.blank? || space_id.blank?

    # Find overlapping events for the same space
    # Two time ranges overlap if: (starts_at < other.ends_at) AND (ends_at > other.starts_at)
    overlapping = Event.where(space_id: space_id)
                       .where("starts_at < ? AND ends_at > ?", ends_at, starts_at)

    # Exclude the current record when updating
    overlapping = overlapping.where.not(id: id) if persisted?

    if overlapping.exists?
      errors.add(:base, "選択した時間帯は既に予約されています")
    end
  end
end
