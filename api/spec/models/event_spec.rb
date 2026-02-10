# frozen_string_literal: true

require "rails_helper"

RSpec.describe Event, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:space) }
    it { is_expected.to have_many(:event_participations).dependent(:destroy) }
    it { is_expected.to have_many(:users).through(:event_participations) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:starts_at) }
    it { is_expected.to validate_presence_of(:ends_at) }

    describe "#ends_at_after_starts_at" do
      it "is invalid when ends_at is before starts_at" do
        event = build(:event, starts_at: 1.day.from_now, ends_at: 1.day.ago)
        expect(event).not_to be_valid
        expect(event.errors[:ends_at]).to include("は開始日時より後にしてください")
      end

      it "is invalid when ends_at equals starts_at" do
        time = 1.day.from_now
        event = build(:event, starts_at: time, ends_at: time)
        expect(event).not_to be_valid
        expect(event.errors[:ends_at]).to include("は開始日時より後にしてください")
      end

      it "is valid when ends_at is after starts_at" do
        event = build(:event, starts_at: 1.day.from_now, ends_at: 1.day.from_now + 2.hours)
        expect(event).to be_valid
      end
    end
  end

  describe "factory" do
    it "has a valid factory" do
      expect(build(:event)).to be_valid
    end

    it "can create an event" do
      expect { create(:event) }.to change(Event, :count).by(1)
    end
  end
end
