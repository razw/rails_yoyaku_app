# frozen_string_literal: true

require "rails_helper"

RSpec.describe User, type: :model do
  describe "validations" do
    subject { build(:user) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to have_secure_password }
  end

  describe "callbacks" do
    describe "#normalize_email" do
      it "normalizes email to lowercase" do
        user = build(:user, email: "TEST@Example.COM")
        user.valid?
        expect(user.email).to eq("test@example.com")
      end

      it "strips whitespace from email" do
        user = build(:user, email: "  test@example.com  ")
        user.valid?
        expect(user.email).to eq("test@example.com")
      end
    end
  end

  describe "factory" do
    it "has a valid factory" do
      expect(build(:user)).to be_valid
    end

    it "can create a user" do
      expect { create(:user) }.to change(User, :count).by(1)
    end
  end
end
