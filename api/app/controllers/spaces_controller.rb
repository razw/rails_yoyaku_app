class SpacesController < ApplicationController
  def index
    spaces = Space.all
    render json: { spaces: spaces.map { |space| space_response(space) } }, status: :ok
  end

  def show
    space = Space.find(params[:id])
    render json: { space: space_response(space) }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: "not_found" }, status: :not_found
  end

  private

  def space_response(space)
    {
      id: space.id,
      name: space.name,
      description: space.description,
      capacity: space.capacity,
      price: space.price,
      address: space.address
    }
  end
end
