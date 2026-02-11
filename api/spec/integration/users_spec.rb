# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "Users API", type: :request do
  path "/signup" do
    post "ユーザー登録" do
      tags "Authentication"
      consumes "application/json"
      produces "application/json"
      description "新しいユーザーアカウントを作成します"

      parameter name: :user_params, in: :body, schema: {
        "$ref" => "#/components/schemas/UserInput"
      }

      response "201", "ユーザー登録成功" do
        schema type: :object,
               properties: {
                 user: { "$ref" => "#/components/schemas/User" }
               },
               required: %w[ user ]

        let(:user_params) do
          {
            user: {
              name: "Test User",
              email: "test@example.com",
              password: "password123",
              password_confirmation: "password123"
            }
          }
        end

        run_test!
      end

      response "422", "バリデーションエラー" do
        schema "$ref" => "#/components/schemas/ValidationErrors"

        let(:user_params) do
          {
            user: {
              name: "",
              email: "invalid",
              password: "short",
              password_confirmation: "mismatch"
            }
          }
        end

        run_test!
      end
    end
  end
end
