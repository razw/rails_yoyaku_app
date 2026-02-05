class SessionsController < ApplicationController
  def show
    if current_user
      render json: { user: user_response(current_user) }, status: :ok
    else
      render json: { user: nil }, status: :ok
    end
  end

  def create
    user = User.find_by(email: session_params[:email].to_s.strip.downcase)

    if user&.authenticate(session_params[:password].to_s)
      session[:user_id] = user.id
      render json: { user: user_response(user) }, status: :ok
    else
      render json: { error: "invalid_email_or_password" }, status: :unauthorized
    end
  end

  def destroy
    reset_session
    head :no_content
  end

  private

  def session_params
    params.permit(:email, :password)
  end
end
