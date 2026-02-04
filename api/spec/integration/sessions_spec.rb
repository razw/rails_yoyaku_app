# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Sessions API', type: :request do
  path '/login' do
    post 'ログイン' do
      tags 'Authentication'
      consumes 'application/json'
      produces 'application/json'
      description 'メールアドレスとパスワードでログインします'

      parameter name: :credentials, in: :body, schema: {
        '$ref' => '#/components/schemas/LoginInput'
      }

      response '200', 'ログイン成功' do
        schema type: :object,
               properties: {
                 user: { '$ref' => '#/components/schemas/User' }
               },
               required: %w[user]

        before do
          User.create!(
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            password_confirmation: 'password123'
          )
        end

        let(:credentials) do
          {
            email: 'test@example.com',
            password: 'password123'
          }
        end

        run_test!
      end

      response '401', '認証エラー' do
        schema '$ref' => '#/components/schemas/Error'

        let(:credentials) do
          {
            email: 'wrong@example.com',
            password: 'wrongpassword'
          }
        end

        run_test!
      end
    end
  end

  path '/logout' do
    delete 'ログアウト' do
      tags 'Authentication'
      description '現在のセッションを終了します'

      response '204', 'ログアウト成功' do
        run_test!
      end
    end
  end
end
