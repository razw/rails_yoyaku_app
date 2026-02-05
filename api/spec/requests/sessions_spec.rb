# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Sessions", type: :request do
  let!(:user) { create(:user, email: "test@example.com", password: "password123") }

  describe "GET /me" do
    context "when logged in" do
      before do
        post login_path, params: { email: "test@example.com", password: "password123" }, as: :json
      end

      it "returns ok status" do
        get me_path, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "returns current user data" do
        get me_path, as: :json
        json = JSON.parse(response.body)
        expect(json["user"]).to include(
          "id" => user.id,
          "name" => user.name,
          "email" => "test@example.com"
        )
      end
    end

    context "when not logged in" do
      it "returns ok status" do
        get me_path, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "returns null user" do
        get me_path, as: :json
        json = JSON.parse(response.body)
        expect(json["user"]).to be_nil
      end
    end
  end

  describe "POST /login" do
    context "with valid credentials" do
      let(:valid_params) do
        { email: "test@example.com", password: "password123" }
      end

      it "returns ok status" do
        post login_path, params: valid_params, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "returns user data" do
        post login_path, params: valid_params, as: :json
        json = JSON.parse(response.body)
        expect(json["user"]).to include(
          "id" => user.id,
          "name" => user.name,
          "email" => "test@example.com"
        )
      end

      it "sets session user_id" do
        post login_path, params: valid_params, as: :json
        expect(session[:user_id]).to eq(user.id)
      end

      it "handles email with different case" do
        post login_path, params: { email: "TEST@EXAMPLE.COM", password: "password123" }, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "handles email with whitespace" do
        post login_path, params: { email: "  test@example.com  ", password: "password123" }, as: :json
        expect(response).to have_http_status(:ok)
      end
    end

    context "with invalid credentials" do
      it "returns unauthorized with wrong password" do
        post login_path, params: { email: "test@example.com", password: "wrongpassword" }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end

      it "returns unauthorized with non-existent email" do
        post login_path, params: { email: "nonexistent@example.com", password: "password123" }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end

      it "returns error message" do
        post login_path, params: { email: "test@example.com", password: "wrongpassword" }, as: :json
        json = JSON.parse(response.body)
        expect(json["error"]).to eq("invalid_email_or_password")
      end

      it "does not set session" do
        post login_path, params: { email: "test@example.com", password: "wrongpassword" }, as: :json
        expect(session[:user_id]).to be_nil
      end
    end
  end

  describe "DELETE /logout" do
    before do
      post login_path, params: { email: "test@example.com", password: "password123" }, as: :json
    end

    it "returns no_content status" do
      delete logout_path, as: :json
      expect(response).to have_http_status(:no_content)
    end

    it "clears session" do
      delete logout_path, as: :json
      expect(session[:user_id]).to be_nil
    end
  end
end
