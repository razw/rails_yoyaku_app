# frozen_string_literal: true

FactoryBot.define do
  factory :space do
    name { Faker::Company.name }
    description { Faker::Lorem.paragraph }
    capacity { Faker::Number.between(from: 1, to: 50) }
    price { "#{Faker::Number.between(from: 500, to: 10000)}円/時間" }
    address { Faker::Address.full_address }
  end
end
