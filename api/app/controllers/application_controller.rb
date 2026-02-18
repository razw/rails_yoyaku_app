class ApplicationController < ActionController::API
  include ActionController::Cookies
  include ActionController::RequestForgeryProtection

  protect_from_forgery with: :exception

  skip_forgery_protection if: -> { Rails.env.test? }

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end

  def require_login
    return if current_user

    render json: { error: "unauthorized" }, status: :unauthorized
  end

  def require_admin
    return if current_user&.admin?

    render json: { error: "forbidden" }, status: :forbidden
  end

  def user_response(user)
    {
      id: user.id,
      name: user.name,
      email: user.email,
      admin: user.admin
    }
  end
end
