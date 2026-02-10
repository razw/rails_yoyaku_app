# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Spaces", type: :request do
  describe "GET /spaces" do
    context "when spaces exist" do
      let!(:spaces) { create_list(:space, 3) }

      it "returns ok status" do
        get spaces_path, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "returns all spaces" do
        get spaces_path, as: :json
        json = JSON.parse(response.body)
        expect(json["spaces"].length).to eq(3)
      end

      it "returns space attributes" do
        get spaces_path, as: :json
        json = JSON.parse(response.body)
        space = json["spaces"].first
        expect(space).to include("id", "name", "description", "capacity", "price", "address")
      end
    end

    context "when no spaces exist" do
      it "returns ok status" do
        get spaces_path, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "returns empty array" do
        get spaces_path, as: :json
        json = JSON.parse(response.body)
        expect(json["spaces"]).to eq([])
      end
    end
  end

  describe "GET /spaces/:id" do
    context "when space exists" do
      let!(:space) { create(:space, name: "スタジオA") }

      it "returns ok status" do
        get space_path(space), as: :json
        expect(response).to have_http_status(:ok)
      end

      it "returns the space" do
        get space_path(space), as: :json
        json = JSON.parse(response.body)
        expect(json["space"]).to include(
          "id" => space.id,
          "name" => "スタジオA"
        )
      end

      it "returns all space attributes" do
        get space_path(space), as: :json
        json = JSON.parse(response.body)
        expect(json["space"]).to include("id", "name", "description", "capacity", "price", "address")
      end
    end

    context "when space does not exist" do
      it "returns not_found status" do
        get space_path(id: 99999), as: :json
        expect(response).to have_http_status(:not_found)
      end

      it "returns error message" do
        get space_path(id: 99999), as: :json
        json = JSON.parse(response.body)
        expect(json["error"]).to eq("not_found")
      end
    end
  end
end
