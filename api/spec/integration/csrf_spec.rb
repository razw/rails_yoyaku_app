# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "CSRF API", type: :request do
  path "/csrf" do
    get "CSRFトークンを取得" do
      tags "CSRF"
      produces "application/json"
      description "フロントエンドがAPIリクエスト時に使用するCSRFトークンを取得します"

      response "200", "CSRFトークン取得成功" do
        schema "$ref" => "#/components/schemas/CsrfToken"

        run_test!
      end
    end
  end
end
