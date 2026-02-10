# frozen_string_literal: true

require "rails_helper"

RSpec.describe Space, type: :model do
  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
  end

  describe "factory" do
    it "has a valid factory" do
      expect(build(:space)).to be_valid
    end

    it "can create a space" do
      expect { create(:space) }.to change(Space, :count).by(1)
    end
  end
end
