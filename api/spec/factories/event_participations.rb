# frozen_string_literal: true

FactoryBot.define do
  factory :event_participation do
    event
    user
  end
end
