# frozen_string_literal: true

require "rails_helper"

RSpec.describe EventParticipation, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:event) }
    it { is_expected.to belong_to(:user) }
  end

  describe "validations" do
    subject { create(:event_participation) }

    it { is_expected.to validate_uniqueness_of(:user_id).scoped_to(:event_id).with_message("はすでにこのイベントに参加しています") }
  end

  describe "factory" do
    it "has a valid factory" do
      expect(build(:event_participation)).to be_valid
    end

    it "can create an event_participation" do
      expect { create(:event_participation) }.to change(EventParticipation, :count).by(1)
    end
  end

  describe "duplicate participation" do
    it "does not allow the same user to participate in the same event twice" do
      participation = create(:event_participation)
      duplicate = build(:event_participation, event: participation.event, user: participation.user)
      expect(duplicate).not_to be_valid
    end
  end
end
