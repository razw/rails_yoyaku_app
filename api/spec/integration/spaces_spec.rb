# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Spaces API', type: :request do
  path '/spaces' do
    get 'スペース一覧を取得' do
      tags 'Spaces'
      produces 'application/json'
      description '全てのスペースの一覧を取得します'

      response '200', 'スペース一覧取得成功' do
        schema type: :object,
               properties: {
                 spaces: {
                   type: :array,
                   items: { '$ref' => '#/components/schemas/Space' }
                 }
               },
               required: %w[spaces]

        before do
          Space.create!(name: 'スタジオA', description: '小規模なスペース', capacity: 5, price: '1,000円/時間', address: '東京都渋谷区1-1-1')
          Space.create!(name: 'スタジオB', description: '中規模なスペース', capacity: 10, price: '2,000円/時間', address: '東京都新宿区2-2-2')
        end

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['spaces'].length).to eq(2)
        end
      end
    end
  end

  path '/spaces/{id}' do
    get 'スペース詳細を取得' do
      tags 'Spaces'
      produces 'application/json'
      description '指定されたIDのスペース詳細を取得します'

      parameter name: :id, in: :path, type: :integer, description: 'スペースID'

      response '200', 'スペース詳細取得成功' do
        schema type: :object,
               properties: {
                 space: { '$ref' => '#/components/schemas/Space' }
               },
               required: %w[space]

        let(:id) do
          Space.create!(name: 'スタジオA', description: '小規模なスペース', capacity: 5, price: '1,000円/時間', address: '東京都渋谷区1-1-1').id
        end

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['space']['name']).to eq('スタジオA')
        end
      end

      response '404', 'スペースが見つからない' do
        schema '$ref' => '#/components/schemas/Error'

        let(:id) { 99999 }

        run_test! do |response|
          json = JSON.parse(response.body)
          expect(json['error']).to eq('not_found')
        end
      end
    end
  end
end
