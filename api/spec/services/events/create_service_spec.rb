# frozen_string_literal: true

require "rails_helper"

RSpec.describe Events::CreateService do
  let(:space) { create(:space) }
  let(:valid_params) do
    {
      name: "Rails勉強会",
      description: "Railsについて学ぶ会",
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now + 2.hours,
      space_id: space.id
    }
  end

  describe "#call" do
    context "when user is a regular user" do
      let(:user) { create(:user) }

      it "creates an event" do
        expect {
          described_class.new(user, valid_params).call
        }.to change(Event, :count).by(1)
      end

      it "sets status to pending" do
        event = described_class.new(user, valid_params).call
        expect(event).to be_pending
      end

      it "enqueues a booking_request email" do
        expect {
          described_class.new(user, valid_params).call
        }.to have_enqueued_mail(UserMailer, :booking_request)
      end

      it "does not enqueue a booking_approved email" do
        expect {
          described_class.new(user, valid_params).call
        }.not_to have_enqueued_mail(UserMailer, :booking_approved)
      end

      it "returns the event" do
        event = described_class.new(user, valid_params).call
        expect(event).to be_a(Event)
        expect(event).to be_persisted
      end
    end

    context "when user is an admin" do
      let(:admin) { create(:user, :admin) }

      it "creates an event" do
        expect {
          described_class.new(admin, valid_params).call
        }.to change(Event, :count).by(1)
      end

      it "sets status to approved" do
        event = described_class.new(admin, valid_params).call
        expect(event).to be_approved
      end

      it "enqueues a booking_approved email" do
        expect {
          described_class.new(admin, valid_params).call
        }.to have_enqueued_mail(UserMailer, :booking_approved)
      end

      it "does not enqueue a booking_request email" do
        expect {
          described_class.new(admin, valid_params).call
        }.not_to have_enqueued_mail(UserMailer, :booking_request)
      end
    end

    context "with invalid params" do
      let(:user) { create(:user) }

      it "does not create an event" do
        expect {
          described_class.new(user, valid_params.merge(name: "")).call
        }.not_to change(Event, :count)
      end

      it "returns an unpersisted event" do
        event = described_class.new(user, valid_params.merge(name: "")).call
        expect(event).not_to be_persisted
      end

      it "does not enqueue any email" do
        expect {
          described_class.new(user, valid_params.merge(name: "")).call
        }.not_to have_enqueued_mail(UserMailer)
      end
    end
  end
end
