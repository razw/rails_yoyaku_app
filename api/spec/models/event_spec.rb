# frozen_string_literal: true

require "rails_helper"

RSpec.describe Event, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:space) }
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:status).with_values(pending: 0, approved: 1, rejected: 2) }

    it "defaults to pending" do
      event = Event.new
      expect(event.status).to eq("pending")
    end
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

    describe "#no_overlapping_events" do
      let(:space) { create(:space) }
      let(:user) { create(:user) }
      let(:base_time) { Time.zone.local(2026, 2, 15, 10, 0, 0) }

      before do
        # Create an existing approved event: 10:00 - 12:00
        create(:event, :approved,
               space: space,
               user: user,
               starts_at: base_time,
               ends_at: base_time + 2.hours)
      end

      it "is invalid when new event starts during existing event" do
        # New event: 11:00 - 13:00 (overlaps with 10:00 - 12:00)
        event = build(:event,
                      space: space,
                      user: user,
                      starts_at: base_time + 1.hour,
                      ends_at: base_time + 3.hours)
        expect(event).not_to be_valid
        expect(event.errors[:base]).to include("選択した時間帯は既に予約されています")
      end

      it "is invalid when new event ends during existing event" do
        # New event: 9:00 - 11:00 (overlaps with 10:00 - 12:00)
        event = build(:event,
                      space: space,
                      user: user,
                      starts_at: base_time - 1.hour,
                      ends_at: base_time + 1.hour)
        expect(event).not_to be_valid
        expect(event.errors[:base]).to include("選択した時間帯は既に予約されています")
      end

      it "is invalid when new event completely encompasses existing event" do
        # New event: 9:00 - 13:00 (encompasses 10:00 - 12:00)
        event = build(:event,
                      space: space,
                      user: user,
                      starts_at: base_time - 1.hour,
                      ends_at: base_time + 3.hours)
        expect(event).not_to be_valid
        expect(event.errors[:base]).to include("選択した時間帯は既に予約されています")
      end

      it "is invalid when existing event completely encompasses new event" do
        # New event: 10:30 - 11:30 (within 10:00 - 12:00)
        event = build(:event,
                      space: space,
                      user: user,
                      starts_at: base_time + 30.minutes,
                      ends_at: base_time + 1.hour + 30.minutes)
        expect(event).not_to be_valid
        expect(event.errors[:base]).to include("選択した時間帯は既に予約されています")
      end

      it "is valid when new event is completely before existing event" do
        # New event: 8:00 - 10:00 (before 10:00 - 12:00)
        event = build(:event,
                      space: space,
                      user: user,
                      starts_at: base_time - 2.hours,
                      ends_at: base_time)
        expect(event).to be_valid
      end

      it "is valid when new event is completely after existing event" do
        # New event: 12:00 - 14:00 (after 10:00 - 12:00)
        event = build(:event,
                      space: space,
                      user: user,
                      starts_at: base_time + 2.hours,
                      ends_at: base_time + 4.hours)
        expect(event).to be_valid
      end

      it "is valid when new event is for a different space" do
        different_space = create(:space)
        # New event: 10:00 - 12:00 but in a different space
        event = build(:event,
                      space: different_space,
                      user: user,
                      starts_at: base_time,
                      ends_at: base_time + 2.hours)
        expect(event).to be_valid
      end

      it "allows updating an event without triggering overlap with itself" do
        existing_event = Event.find_by(space: space)
        existing_event.name = "Updated name"
        expect(existing_event).to be_valid
        expect(existing_event.save).to be true
      end

      it "does not check overlap against pending events" do
        # Create a pending event: 10:00 - 12:00 on a different day
        pending_time = base_time + 1.day
        create(:event,
               space: space,
               user: user,
               starts_at: pending_time,
               ends_at: pending_time + 2.hours,
               status: :pending)

        # Overlapping event should be valid because existing one is pending
        event = build(:event,
                      space: space,
                      user: user,
                      starts_at: pending_time + 1.hour,
                      ends_at: pending_time + 3.hours)
        expect(event).to be_valid
      end

      it "does not check overlap against rejected events" do
        rejected_time = base_time + 2.days
        create(:event,
               space: space,
               user: user,
               starts_at: rejected_time,
               ends_at: rejected_time + 2.hours,
               status: :rejected)

        event = build(:event,
                      space: space,
                      user: user,
                      starts_at: rejected_time + 1.hour,
                      ends_at: rejected_time + 3.hours)
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
