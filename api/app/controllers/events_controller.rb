class EventsController < ApplicationController
  before_action :require_login, only: %i[create update destroy approve reject]
  before_action :set_event, only: %i[show update destroy approve reject]
  before_action :authorize_organizer, only: %i[update destroy]
  before_action :require_admin, only: %i[approve reject]

  def index
    events = Event.includes(:space)
    events = events.where(space_id: params[:space_id]) if params[:space_id].present?
    render json: { events: events.map { |event| event_response(event) } }, status: :ok
  end

  def show
    render json: { event: event_response(@event) }, status: :ok
  end

  def create
    event = current_user.organized_events.build(event_params)
    if event.save
      render json: { event: event_response(event) }, status: :created
    else
      render json: { errors: event.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @event.update(event_params)
      render json: { event: event_response(@event) }, status: :ok
    else
      render json: { errors: @event.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @event.destroy!
    head :no_content
  end

  def approve
    unless @event.pending?
      return render json: { error: "only pending events can be approved" }, status: :unprocessable_entity
    end

    @event.approved!
    render json: { event: event_response(@event) }, status: :ok
  end

  def reject
    unless @event.pending?
      return render json: { error: "only pending events can be rejected" }, status: :unprocessable_entity
    end

    @event.rejected!
    render json: { event: event_response(@event) }, status: :ok
  end

  private

  def set_event
    @event = Event.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "not_found" }, status: :not_found
  end

  def authorize_organizer
    unless @event.user_id == current_user.id
      render json: { error: "forbidden" }, status: :forbidden
    end
  end

  def event_params
    params.require(:event).permit(:name, :description, :starts_at, :ends_at, :space_id)
  end

  def event_response(event)
    {
      id: event.id,
      name: event.name,
      description: event.description,
      starts_at: event.starts_at,
      ends_at: event.ends_at,
      space_id: event.space_id,
      space: {
        id: event.space.id,
        name: event.space.name
      },
      organizer: {
        id: event.user.id,
        name: event.user.name
      },
      is_organizer: current_user&.id == event.user_id,
      is_admin: current_user&.admin? || false,
      status: event.status
    }
  end
end
