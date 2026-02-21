class DropEventParticipations < ActiveRecord::Migration[8.1]
  def change
    drop_table :event_participations do |t|
      t.bigint :event_id, null: false
      t.bigint :user_id, null: false
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
    end
  end
end
