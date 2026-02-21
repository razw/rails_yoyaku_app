# Create users
puts "Creating users..."
user1 = User.find_or_create_by!(email: "tanaka@example.com") do |user|
  user.name = "田中太郎"
  user.password = "password123"
  user.password_confirmation = "password123"
  user.admin = true
end

user2 = User.find_or_create_by!(email: "sato@example.com") do |user|
  user.name = "佐藤花子"
  user.password = "password123"
  user.password_confirmation = "password123"
end

user3 = User.find_or_create_by!(email: "suzuki@example.com") do |user|
  user.name = "鈴木一郎"
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

# Current event (occupied) - 9:30 AM to 10:30 AM
event1 = Event.create!(
  name: "営業ミーティング",
  description: "週次営業会議",
  space: space_objects["スタジオA"],
  user: user1,
  starts_at: base_time - 30.minutes,
  ends_at: base_time + 30.minutes,
  status: :approved
)

# Upcoming events today
# 12:00 PM to 1:00 PM
event2 = Event.create!(
  name: "企画会議",
  description: "新プロジェクトの企画会議",
  space: space_objects["スタジオB"],
  user: user1,
  starts_at: base_time + 2.hours,
  ends_at: base_time + 3.hours,
  status: :approved
)

# 2:00 PM to 4:00 PM
event3 = Event.create!(
  name: "音楽練習",
  description: "バンド練習",
  space: space_objects["スタジオE"],
  user: user2,
  starts_at: base_time + 4.hours,
  ends_at: base_time + 6.hours,
  status: :approved
)

# Tomorrow's event - 12:00 PM to 2:00 PM
event4 = Event.create!(
  name: "セミナー",
  description: "社内研修セミナー",
  space: space_objects["スタジオC"],
  user: user1,
  starts_at: base_time + 1.day + 2.hours,
  ends_at: base_time + 1.day + 4.hours,
  status: :approved
)

# Event in 3 days - 8:00 PM to 9:00 PM
event5 = Event.create!(
  name: "チームミーティング",
  description: "開発チームの定例会議",
  space: space_objects["スタジオA"],
  user: user2,
  starts_at: base_time + 3.days + 10.hours,
  ends_at: base_time + 3.days + 11.hours,
  status: :approved
)

# Pending event (tomorrow) - user2 requesting スタジオD
event6 = Event.create!(
  name: "ヨガレッスン",
  description: "朝のヨガレッスン（承認待ち）",
  space: space_objects["スタジオD"],
  user: user2,
  starts_at: base_time + 1.day,
  ends_at: base_time + 1.day + 1.hour,
  status: :pending
)

# Pending event (2 days later) - user1 requesting スタジオE
event7 = Event.create!(
  name: "社内勉強会",
  description: "技術共有会（承認待ち）",
  space: space_objects["スタジオE"],
  user: user1,
  starts_at: base_time + 2.days + 3.hours,
  ends_at: base_time + 2.days + 5.hours,
  status: :pending
)

# Pending event (3 days later) - user3 requesting スタジオB
event8 = Event.create!(
  name: "写真撮影会",
  description: "ポートレート撮影会（承認待ち）",
  space: space_objects["スタジオB"],
  user: user3,
  starts_at: base_time + 3.days + 2.hours,
  ends_at: base_time + 3.days + 4.hours,
  status: :pending
)

# Approved event (4 days later) - user3
event9 = Event.create!(
  name: "読書会",
  description: "月例読書会",
  space: space_objects["スタジオD"],
  user: user3,
  starts_at: base_time + 4.days + 1.hour,
  ends_at: base_time + 4.days + 3.hours,
  status: :approved
)

puts "Created #{Event.count} events"

puts "\n=== Seed data creation completed! ==="
puts "Users: #{User.count}"
puts "Spaces: #{Space.count}"
puts "Events: #{Event.count}"
puts "\nTest credentials:"
puts "Email: tanaka@example.com"
puts "Password: password123"
puts "\nEmail: sato@example.com"
puts "Password: password123"
puts "\nEmail: suzuki@example.com"
puts "Password: password123"
