class ApplicationController < ActionController::API
  include ActionController::Cookies

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end

  def require_login
    return if current_user

    render json: { error: "unauthorized" }, status: :unauthorized
  end

  def user_response(user)
    {
      id: user.id,
      name: user.name,
      email: user.email
    }
  end
end
