# Create users
puts "Creating users..."
user1 = User.find_or_create_by!(email: "tanaka@example.com") do |user|
  user.name = "田中太郎"
  user.password = "password123"
  user.password_confirmation = "password123"
end

user2 = User.find_or_create_by!(email: "sato@example.com") do |user|
  user.name = "佐藤花子"
  user.password = "password123"
  user.password_confirmation = "password123"
end

puts "Created #{User.count} users"

# Create spaces
puts "Creating spaces..."
spaces = [
  { name: "スタジオA", description: "小規模なミーティングに最適なスペースです。", capacity: 5, price: "1,000円/時間", address: "東京都渋谷区1-1-1" },
  { name: "スタジオB", description: "中規模のワークショップ向けスペースです。", capacity: 10, price: "2,000円/時間", address: "東京都渋谷区2-2-2" },
  { name: "スタジオC", description: "大人数のセミナーに対応できる広いスペースです。", capacity: 30, price: "5,000円/時間", address: "東京都新宿区3-3-3" },
  { name: "スタジオD", description: "静かな環境で集中作業に向いています。", capacity: 3, price: "800円/時間", address: "東京都港区4-4-4" },
  { name: "スタジオE", description: "イベントや発表会に使える多目的スペースです。", capacity: 50, price: "10,000円/時間", address: "東京都千代田区5-5-5" }
]

space_objects = {}
spaces.each do |space_attrs|
  space = Space.find_or_create_by!(name: space_attrs[:name]) do |s|
    s.assign_attributes(space_attrs.except(:name))
  end
  space_objects[space_attrs[:name]] = space
end

puts "Created #{Space.count} spaces"

# Create events
puts "Creating events..."
# Use 10 AM today as base time for demo purposes (instead of current time)
# This ensures events are always created during daytime hours
today = Date.current
base_time = Time.zone.local(today.year, today.month, today.day, 10, 0, 0)

# Clear existing events to avoid conflicts
Event.destroy_all
EventParticipation.destroy_all

# Current event (occupied) - 9:30 AM to 10:30 AM
event1 = Event.create!(
  name: "営業ミーティング",
  description: "週次営業会議",
  space: space_objects["スタジオA"],
  user: user1,
  starts_at: base_time - 30.minutes,
  ends_at: base_time + 30.minutes
)

# Upcoming events today
# 12:00 PM to 1:00 PM
event2 = Event.create!(
  name: "企画会議",
  description: "新プロジェクトの企画会議",
  space: space_objects["スタジオB"],
  user: user1,
  starts_at: base_time + 2.hours,
  ends_at: base_time + 3.hours
)

# 2:00 PM to 4:00 PM
event3 = Event.create!(
  name: "音楽練習",
  description: "バンド練習",
  space: space_objects["スタジオE"],
  user: user2,
  starts_at: base_time + 4.hours,
  ends_at: base_time + 6.hours
)

# Tomorrow's event - 12:00 PM to 2:00 PM
event4 = Event.create!(
  name: "セミナー",
  description: "社内研修セミナー",
  space: space_objects["スタジオC"],
  user: user1,
  starts_at: base_time + 1.day + 2.hours,
  ends_at: base_time + 1.day + 4.hours
)

# Event in 3 days - 8:00 PM to 9:00 PM
event5 = Event.create!(
  name: "チームミーティング",
  description: "開発チームの定例会議",
  space: space_objects["スタジオA"],
  user: user2,
  starts_at: base_time + 3.days + 10.hours,
  ends_at: base_time + 3.days + 11.hours
)

puts "Created #{Event.count} events"

# Add event participations
puts "Adding event participations..."
EventParticipation.create!(user: user1, event: event1)
EventParticipation.create!(user: user2, event: event1)

EventParticipation.create!(user: user1, event: event2)

EventParticipation.create!(user: user2, event: event3)
EventParticipation.create!(user: user1, event: event3)

EventParticipation.create!(user: user1, event: event4)
EventParticipation.create!(user: user2, event: event4)

EventParticipation.create!(user: user2, event: event5)

puts "Created #{EventParticipation.count} event participations"

puts "\n=== Seed data creation completed! ==="
puts "Users: #{User.count}"
puts "Spaces: #{Space.count}"
puts "Events: #{Event.count}"
puts "Event Participations: #{EventParticipation.count}"
puts "\nTest credentials:"
puts "Email: tanaka@example.com"
puts "Password: password123"
puts "\nEmail: sato@example.com"
puts "Password: password123"
