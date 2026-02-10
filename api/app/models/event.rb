class Event < ApplicationRecord
  belongs_to :space

  has_many :event_participations, dependent: :destroy
  has_many :users, through: :event_participations

  validates :name, presence: true
  validates :starts_at, presence: true
  validates :ends_at, presence: true
  validate :ends_at_after_starts_at

  private

  def ends_at_after_starts_at
    return if starts_at.blank? || ends_at.blank?

    if ends_at <= starts_at
      errors.add(:ends_at, "は開始日時より後にしてください")
    end
  end
end
