class HomeController < ApplicationController
  before_action :require_login

  def index
    target_date = params[:date] ? Date.parse(params[:date]) : Date.current
    target_time = params[:time] ? Time.zone.parse(params[:time]) : Time.current

    spaces = Space.includes(:events).all.map do |space|
      status_info = space.status_at(target_time)

      {
        id: space.id,
        name: space.name,
        description: space.description,
        capacity: space.capacity,
        price: space.price,
        address: space.address,
        status: status_info[:status],
        occupied_until: status_info[:until],
        next_event_at: status_info[:next_event_at],
        current_event: status_info[:event] ? event_summary(status_info[:event]) : nil
      }
    end

    spaces.sort_by! { |space| space[:id] }

    # Get all events for the selected date (for timeline view)
    day_start = target_date.beginning_of_day
    day_end = target_date.end_of_day

    # Get all events that start or overlap with the selected date
    all_events = Event.includes(:space, :user)
                      .where("starts_at < ? AND ends_at > ?", day_end, day_start)
                      .order(:starts_at)

    # Hide rejected events from non-admin users (except their own)
    unless current_user.admin?
      all_events = all_events.where.not(status: :rejected)
                              .or(all_events.where(status: :rejected, user_id: current_user.id))
    end

    user_organized_event_ids = current_user.organized_events.pluck(:id)

    timeline_events = all_events.map do |event|
      is_organizer = event.user_id == current_user.id

      {
        id: event.id,
        name: event.name,
        description: event.description,
        starts_at: event.starts_at,
        ends_at: event.ends_at,
        space: {
          id: event.space.id,
          name: event.space.name
        },
        organizer: {
          id: event.user.id,
          name: event.user.name
        },
        is_organizer: is_organizer,
        user_involved: is_organizer,
        status: event.status
      }
    end

    # Get all upcoming events that the current user is organizing
    my_events = Event.includes(:space, :user)
                     .where(id: user_organized_event_ids)
                     .where("ends_at > ?", Time.current)
                     .order(:starts_at)
                     .map do |event|
      {
        id: event.id,
        name: event.name,
        starts_at: event.starts_at,
        ends_at: event.ends_at,
        space: {
          id: event.space.id,
          name: event.space.name
        },
        is_organizer: event.user_id == current_user.id,
        status: event.status
      }
    end

    pending_events = if current_user.admin?
      Event.pending.includes(:space, :user).order(:starts_at).map do |event|
        {
          id: event.id,
          name: event.name,
          starts_at: event.starts_at,
          ends_at: event.ends_at,
          space: {
            id: event.space.id,
            name: event.space.name
          },
          organizer: {
            id: event.user.id,
            name: event.user.name
          },
          status: event.status
        }
      end
    else
      []
    end

    render json: {
      spaces: spaces,
      timeline_events: timeline_events,
      my_events: my_events,
      pending_events: pending_events,
      current_time: target_time,
      target_date: target_date
    }
  end

  private

  def event_summary(event)
    {
      id: event.id,
      name: event.name,
      starts_at: event.starts_at,
      ends_at: event.ends_at
    }
  end
end
