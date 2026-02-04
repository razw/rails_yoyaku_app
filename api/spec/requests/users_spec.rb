# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Users", type: :request do
  describe "POST /signup" do
    let(:valid_params) do
      {
        user: {
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          password_confirmation: "password123"
        }
      }
    end

    context "with valid parameters" do
      it "creates a new user" do
        expect {
          post signup_path, params: valid_params, as: :json
        }.to change(User, :count).by(1)
      end

      it "returns created status" do
        post signup_path, params: valid_params, as: :json
        expect(response).to have_http_status(:created)
      end

      it "returns user data" do
        post signup_path, params: valid_params, as: :json
        json = JSON.parse(response.body)
        expect(json["user"]).to include(
          "name" => "Test User",
          "email" => "test@example.com"
        )
      end

      it "sets session user_id" do
        post signup_path, params: valid_params, as: :json
        expect(session[:user_id]).to eq(User.last.id)
      end
    end

    context "with invalid parameters" do
      it "does not create a user with missing name" do
        invalid_params = valid_params.deep_dup
        invalid_params[:user][:name] = ""

        expect {
          post signup_path, params: invalid_params, as: :json
        }.not_to change(User, :count)
      end

      it "returns unprocessable_entity status" do
        invalid_params = valid_params.deep_dup
        invalid_params[:user][:name] = ""

        post signup_path, params: invalid_params, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "returns error messages" do
        invalid_params = valid_params.deep_dup
        invalid_params[:user][:name] = ""

        post signup_path, params: invalid_params, as: :json
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Name can't be blank")
      end

      it "does not create a user with duplicate email" do
        create(:user, email: "test@example.com")

        expect {
          post signup_path, params: valid_params, as: :json
        }.not_to change(User, :count)
      end

      it "does not create a user with mismatched password confirmation" do
        invalid_params = valid_params.deep_dup
        invalid_params[:user][:password_confirmation] = "different"

        expect {
          post signup_path, params: invalid_params, as: :json
        }.not_to change(User, :count)
      end
    end
  end
end
