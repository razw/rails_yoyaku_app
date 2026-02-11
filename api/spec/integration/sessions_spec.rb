# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "Sessions API", type: :request do
  path "/me" do
    get "現在のユーザー情報を取得" do
      tags "Authentication"
      produces "application/json"
      description "セッションから現在ログイン中のユーザー情報を取得します"

      response "200", "ユーザー情報取得成功（ログイン中）" do
        schema type: :object,
               properties: {
                 user: { "$ref" => "#/components/schemas/User" }
               },
               required: %w[ user ]

        before do
          user = User.create!(
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            password_confirmation: "password123"
          )
          post "/login", params: { email: "test@example.com", password: "password123" }, as: :json
        end

        run_test!
      end

      response "200", "ユーザー情報取得成功（未ログイン）" do
        schema type: :object,
               properties: {
                 user: { type: :null }
               },
               required: %w[ user ]

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json["user"]).to be_nil
        end
      end
    end
  end

  path "/login" do
    post "ログイン" do
      tags "Authentication"
      consumes "application/json"
      produces "application/json"
      description "メールアドレスとパスワードでログインします"

      parameter name: :credentials, in: :body, schema: {
        "$ref" => "#/components/schemas/LoginInput"
      }

      response "200", "ログイン成功" do
        schema type: :object,
               properties: {
                 user: { "$ref" => "#/components/schemas/User" }
               },
               required: %w[ user ]

        before do
          User.create!(
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            password_confirmation: "password123"
          )
        end

        let(:credentials) do
          {
            email: "test@example.com",
            password: "password123"
          }
        end

        run_test!
      end

      response "401", "認証エラー" do
        schema "$ref" => "#/components/schemas/Error"

        let(:credentials) do
          {
            email: "wrong@example.com",
            password: "wrongpassword"
          }
        end

        run_test!
      end
    end
  end

  path "/logout" do
    delete "ログアウト" do
      tags "Authentication"
      description "現在のセッションを終了します"

      response "204", "ログアウト成功" do
        run_test!
      end
    end
  end
end
