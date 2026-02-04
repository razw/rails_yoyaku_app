class CsrfController < ApplicationController
  skip_before_action :verify_authenticity_token

  def show
    # Frontend: call this endpoint first, then send the token as X-CSRF-Token
    render json: { csrf_token: form_authenticity_token }
  end
end
