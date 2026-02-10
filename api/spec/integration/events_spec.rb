# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Events API', type: :request do
  let!(:test_user) do
    User.create!(
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      password_confirmation: 'password123'
    )
  end

  let!(:test_space) do
    Space.create!(name: 'スタジオA', description: '小規模なスペース', capacity: 5, price: '1,000円/時間', address: '東京都渋谷区1-1-1')
  end

  def login_as_test_user
    post '/login', params: { email: 'test@example.com', password: 'password123' }, as: :json
  end

  path '/events' do
    get 'イベント一覧を取得' do
      tags 'Events'
      produces 'application/json'
      description '全てのイベントの一覧を取得します。space_idパラメータでスペースごとに絞り込みが可能です。'

      parameter name: :space_id, in: :query, type: :integer, required: false, description: 'スペースIDで絞り込み'

      response '200', 'イベント一覧取得成功' do
        schema type: :object,
               properties: {
                 events: {
                   type: :array,
                   items: { '$ref' => '#/components/schemas/Event' }
                 }
               },
               required: %w[events]

        before do
          Event.create!(name: 'Ruby勉強会', description: 'Rubyを学ぶ会', starts_at: 1.day.from_now, ends_at: 1.day.from_now + 2.hours, space: test_space)
          Event.create!(name: 'Rails勉強会', description: 'Railsを学ぶ会', starts_at: 2.days.from_now, ends_at: 2.days.from_now + 2.hours, space: test_space)
        end

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['events'].length).to eq(2)
        end
      end
    end

    post 'イベントを作成' do
      tags 'Events'
      consumes 'application/json'
      produces 'application/json'
      description '新しいイベントを作成します（要ログイン）'

      parameter name: :event, in: :body, schema: {
        '$ref' => '#/components/schemas/EventInput'
      }

      response '201', 'イベント作成成功' do
        schema type: :object,
               properties: {
                 event: { '$ref' => '#/components/schemas/Event' }
               },
               required: %w[event]

        before { login_as_test_user }

        let(:event) do
          {
            event: {
              name: 'Ruby勉強会',
              description: 'Rubyを学ぶ会',
              starts_at: 1.day.from_now,
              ends_at: 1.day.from_now + 2.hours,
              space_id: test_space.id
            }
          }
        end

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['event']['name']).to eq('Ruby勉強会')
        end
      end

      response '401', '未認証エラー' do
        schema '$ref' => '#/components/schemas/Error'

        let(:event) do
          {
            event: {
              name: 'Ruby勉強会',
              starts_at: 1.day.from_now,
              ends_at: 1.day.from_now + 2.hours,
              space_id: test_space.id
            }
          }
        end

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['error']).to eq('unauthorized')
        end
      end

      response '422', 'バリデーションエラー' do
        schema '$ref' => '#/components/schemas/ValidationErrors'

        before { login_as_test_user }

        let(:event) do
          {
            event: {
              name: '',
              starts_at: 1.day.from_now,
              ends_at: 1.day.from_now + 2.hours,
              space_id: test_space.id
            }
          }
        end

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['errors']).to be_present
        end
      end
    end
  end

  path '/events/{id}' do
    get 'イベント詳細を取得' do
      tags 'Events'
      produces 'application/json'
      description '指定されたIDのイベント詳細を取得します'

      parameter name: :id, in: :path, type: :integer, description: 'イベントID'

      response '200', 'イベント詳細取得成功' do
        schema type: :object,
               properties: {
                 event: { '$ref' => '#/components/schemas/Event' }
               },
               required: %w[event]

        let(:id) do
          Event.create!(name: 'Ruby勉強会', description: 'Rubyを学ぶ会', starts_at: 1.day.from_now, ends_at: 1.day.from_now + 2.hours, space: test_space).id
        end

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['event']['name']).to eq('Ruby勉強会')
        end
      end

      response '404', 'イベントが見つからない' do
        schema '$ref' => '#/components/schemas/Error'

        let(:id) { 99999 }

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['error']).to eq('not_found')
        end
      end
    end

    patch 'イベントを更新' do
      tags 'Events'
      consumes 'application/json'
      produces 'application/json'
      description '指定されたIDのイベントを更新します（要ログイン）'

      parameter name: :id, in: :path, type: :integer, description: 'イベントID'
      parameter name: :event, in: :body, schema: {
        '$ref' => '#/components/schemas/EventInput'
      }

      response '200', 'イベント更新成功' do
        schema type: :object,
               properties: {
                 event: { '$ref' => '#/components/schemas/Event' }
               },
               required: %w[event]

        before { login_as_test_user }

        let(:id) do
          Event.create!(name: '旧イベント名', starts_at: 1.day.from_now, ends_at: 1.day.from_now + 2.hours, space: test_space).id
        end

        let(:event) do
          { event: { name: '新イベント名' } }
        end

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['event']['name']).to eq('新イベント名')
        end
      end

      response '401', '未認証エラー' do
        schema '$ref' => '#/components/schemas/Error'

        let(:id) do
          Event.create!(name: 'テストイベント', starts_at: 1.day.from_now, ends_at: 1.day.from_now + 2.hours, space: test_space).id
        end

        let(:event) do
          { event: { name: '新イベント名' } }
        end

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['error']).to eq('unauthorized')
        end
      end

      response '404', 'イベントが見つからない' do
        schema '$ref' => '#/components/schemas/Error'

        before { login_as_test_user }

        let(:id) { 99999 }
        let(:event) { { event: { name: '新イベント名' } } }

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['error']).to eq('not_found')
        end
      end

      response '422', 'バリデーションエラー' do
        schema '$ref' => '#/components/schemas/ValidationErrors'

        before { login_as_test_user }

        let(:id) do
          Event.create!(name: 'テストイベント', starts_at: 1.day.from_now, ends_at: 1.day.from_now + 2.hours, space: test_space).id
        end

        let(:event) do
          { event: { name: '' } }
        end

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['errors']).to be_present
        end
      end
    end

    delete 'イベントを削除' do
      tags 'Events'
      description '指定されたIDのイベントを削除します（要ログイン）'

      parameter name: :id, in: :path, type: :integer, description: 'イベントID'

      response '204', 'イベント削除成功' do
        before { login_as_test_user }

        let(:id) do
          Event.create!(name: 'テストイベント', starts_at: 1.day.from_now, ends_at: 1.day.from_now + 2.hours, space: test_space).id
        end

        run_test!
      end

      response '401', '未認証エラー' do
        schema '$ref' => '#/components/schemas/Error'

        let(:id) do
          Event.create!(name: 'テストイベント', starts_at: 1.day.from_now, ends_at: 1.day.from_now + 2.hours, space: test_space).id
        end

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['error']).to eq('unauthorized')
        end
      end

      response '404', 'イベントが見つからない' do
        schema '$ref' => '#/components/schemas/Error'

        before { login_as_test_user }

        let(:id) { 99999 }

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['error']).to eq('not_found')
        end
      end
    end
  end
end
