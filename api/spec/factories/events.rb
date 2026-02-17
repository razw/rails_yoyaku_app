# frozen_string_literal: true

FactoryBot.define do
  factory :event do
    sequence(:starts_at) { |n| n.days.from_now }
    ends_at { starts_at + 2.hours }
    name { Faker::Lorem.sentence(word_count: 3) }
    description { Faker::Lorem.paragraph }
    space
    user

    trait :approved do
      status { :approved }
    end

    trait :rejected do
      status { :rejected }
    end
  end
end
