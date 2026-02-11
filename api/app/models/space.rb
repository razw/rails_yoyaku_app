class Space < ApplicationRecord
  has_many :events, dependent: :destroy

  validates :name, presence: true

  def status_at(time = Time.current)
    current_event = events.where('starts_at <= ? AND ends_at > ?', time, time).first

    if current_event
      { status: :occupied, until: current_event.ends_at, event: current_event }
    else
      next_event = events.where('starts_at > ?', time).order(:starts_at).first
      if next_event
        { status: :available, next_event_at: next_event.starts_at, event: next_event }
      else
        { status: :available, next_event_at: nil, event: nil }
      end
    end
  end

  def available_at?(time = Time.current)
    !events.exists?(['starts_at <= ? AND ends_at > ?', time, time])
  end

  def next_event_after(time = Time.current)
    events.where('starts_at > ?', time).order(:starts_at).first
  end
end
