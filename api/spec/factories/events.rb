# frozen_string_literal: true

FactoryBot.define do
  factory :event do
    name { Faker::Lorem.sentence(word_count: 3) }
    description { Faker::Lorem.paragraph }
    starts_at { 1.day.from_now }
    ends_at { 1.day.from_now + 2.hours }
    space
  end
end
