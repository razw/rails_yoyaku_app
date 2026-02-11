# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Events", type: :request do
  let!(:user) { create(:user, email: "test@example.com", password: "password123") }
  let!(:space) { create(:space, name: "スタジオA") }

  def login
    post login_path, params: { email: "test@example.com", password: "password123" }, as: :json
  end

  describe "GET /events" do
    context "when events exist" do
      let!(:events) { create_list(:event, 3, space: space) }

      it "returns ok status" do
        get events_path, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "returns all events" do
        get events_path, as: :json
        json = JSON.parse(response.body)
        expect(json["events"].length).to eq(3)
      end

      it "returns event attributes" do
        get events_path, as: :json
        json = JSON.parse(response.body)
        event = json["events"].first
        expect(event).to include("id", "name", "description", "starts_at", "ends_at", "space_id", "space")
      end

      it "includes space info" do
        get events_path, as: :json
        json = JSON.parse(response.body)
        event = json["events"].first
        expect(event["space"]).to include("id", "name")
      end
    end

    context "when filtering by space_id" do
      let!(:space_b) { create(:space, name: "スタジオB") }
      let!(:event_a) { create(:event, space: space) }
      let!(:event_b) { create(:event, space: space_b) }

      it "returns only events for the specified space" do
        get events_path(space_id: space.id), as: :json
        json = JSON.parse(response.body)
        expect(json["events"].length).to eq(1)
        expect(json["events"].first["space_id"]).to eq(space.id)
      end

      it "returns empty array when space has no events" do
        space_c = create(:space)
        get events_path(space_id: space_c.id), as: :json
        json = JSON.parse(response.body)
        expect(json["events"]).to eq([])
      end
    end

    context "when no events exist" do
      it "returns ok status" do
        get events_path, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "returns empty array" do
        get events_path, as: :json
        json = JSON.parse(response.body)
        expect(json["events"]).to eq([])
      end
    end
  end

  describe "GET /events/:id" do
    context "when event exists" do
      let!(:event) { create(:event, name: "Ruby勉強会", space: space) }

      it "returns ok status" do
        get event_path(event), as: :json
        expect(response).to have_http_status(:ok)
      end

      it "returns the event" do
        get event_path(event), as: :json
        json = JSON.parse(response.body)
        expect(json["event"]).to include(
          "id" => event.id,
          "name" => "Ruby勉強会"
        )
      end

      it "returns all event attributes" do
        get event_path(event), as: :json
        json = JSON.parse(response.body)
        expect(json["event"]).to include("id", "name", "description", "starts_at", "ends_at", "space_id", "space")
      end
    end

    context "when event does not exist" do
      it "returns not_found status" do
        get event_path(id: 99999), as: :json
        expect(response).to have_http_status(:not_found)
      end

      it "returns error message" do
        get event_path(id: 99999), as: :json
        json = JSON.parse(response.body)
        expect(json["error"]).to eq("not_found")
      end
    end
  end

  describe "POST /events" do
    let(:valid_params) do
      {
        event: {
          name: "Rails勉強会",
          description: "Railsについて学ぶ会",
          starts_at: 1.day.from_now,
          ends_at: 1.day.from_now + 2.hours,
          space_id: space.id
        }
      }
    end

    context "when logged in" do
      before { login }

      context "with valid params" do
        it "returns created status" do
          post events_path, params: valid_params, as: :json
          expect(response).to have_http_status(:created)
        end

        it "creates an event" do
          expect {
            post events_path, params: valid_params, as: :json
          }.to change(Event, :count).by(1)
        end

        it "returns the created event" do
          post events_path, params: valid_params, as: :json
          json = JSON.parse(response.body)
          expect(json["event"]).to include(
            "name" => "Rails勉強会",
            "description" => "Railsについて学ぶ会",
            "space_id" => space.id
          )
        end
      end

      context "with invalid params" do
        it "returns unprocessable_entity when name is missing" do
          post events_path, params: { event: valid_params[:event].merge(name: "") }, as: :json
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it "returns errors" do
          post events_path, params: { event: valid_params[:event].merge(name: "") }, as: :json
          json = JSON.parse(response.body)
          expect(json["errors"]).to be_present
        end

        it "returns unprocessable_entity when ends_at is before starts_at" do
          params = { event: valid_params[:event].merge(ends_at: 1.day.ago) }
          post events_path, params: params, as: :json
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it "does not create an event" do
          expect {
            post events_path, params: { event: valid_params[:event].merge(name: "") }, as: :json
          }.not_to change(Event, :count)
        end
      end
    end

    context "when not logged in" do
      it "returns unauthorized status" do
        post events_path, params: valid_params, as: :json
        expect(response).to have_http_status(:unauthorized)
      end

      it "does not create an event" do
        expect {
          post events_path, params: valid_params, as: :json
        }.not_to change(Event, :count)
      end
    end
  end

  describe "PATCH /events/:id" do
    let!(:event) { create(:event, name: "旧イベント名", space: space, user: user) }
    let(:update_params) { { event: { name: "新イベント名" } } }

    context "when logged in" do
      before { login }

      context "with valid params" do
        it "returns ok status" do
          patch event_path(event), params: update_params, as: :json
          expect(response).to have_http_status(:ok)
        end

        it "updates the event" do
          patch event_path(event), params: update_params, as: :json
          json = JSON.parse(response.body)
          expect(json["event"]["name"]).to eq("新イベント名")
        end

        it "persists the change" do
          patch event_path(event), params: update_params, as: :json
          expect(event.reload.name).to eq("新イベント名")
        end
      end

      context "with invalid params" do
        it "returns unprocessable_entity when name is blank" do
          patch event_path(event), params: { event: { name: "" } }, as: :json
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it "returns errors" do
          patch event_path(event), params: { event: { name: "" } }, as: :json
          json = JSON.parse(response.body)
          expect(json["errors"]).to be_present
        end

        it "does not update the event" do
          patch event_path(event), params: { event: { name: "" } }, as: :json
          expect(event.reload.name).to eq("旧イベント名")
        end
      end

      context "when event does not exist" do
        it "returns not_found status" do
          patch event_path(id: 99999), params: update_params, as: :json
          expect(response).to have_http_status(:not_found)
        end
      end
    end

    context "when not logged in" do
      it "returns unauthorized status" do
        patch event_path(event), params: update_params, as: :json
        expect(response).to have_http_status(:unauthorized)
      end

      it "does not update the event" do
        patch event_path(event), params: update_params, as: :json
        expect(event.reload.name).to eq("旧イベント名")
      end
    end
  end

  describe "DELETE /events/:id" do
    let!(:event) { create(:event, space: space, user: user) }

    context "when logged in" do
      before { login }

      it "returns no_content status" do
        delete event_path(event), as: :json
        expect(response).to have_http_status(:no_content)
      end

      it "deletes the event" do
        expect {
          delete event_path(event), as: :json
        }.to change(Event, :count).by(-1)
      end

      context "when event does not exist" do
        it "returns not_found status" do
          delete event_path(id: 99999), as: :json
          expect(response).to have_http_status(:not_found)
        end
      end
    end

    context "when not logged in" do
      it "returns unauthorized status" do
        delete event_path(event), as: :json
        expect(response).to have_http_status(:unauthorized)
      end

      it "does not delete the event" do
        expect {
          delete event_path(event), as: :json
        }.not_to change(Event, :count)
      end
    end
  end
end
