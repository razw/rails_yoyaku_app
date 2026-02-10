spaces = [
  { name: "スタジオA", description: "小規模なミーティングに最適なスペースです。", capacity: 5, price: "1,000円/時間", address: "東京都渋谷区1-1-1" },
  { name: "スタジオB", description: "中規模のワークショップ向けスペースです。", capacity: 10, price: "2,000円/時間", address: "東京都渋谷区2-2-2" },
  { name: "スタジオC", description: "大人数のセミナーに対応できる広いスペースです。", capacity: 30, price: "5,000円/時間", address: "東京都新宿区3-3-3" },
  { name: "スタジオD", description: "静かな環境で集中作業に向いています。", capacity: 3, price: "800円/時間", address: "東京都港区4-4-4" },
  { name: "スタジオE", description: "イベントや発表会に使える多目的スペースです。", capacity: 50, price: "10,000円/時間", address: "東京都千代田区5-5-5" }
]

spaces.each do |space_attrs|
  Space.find_or_create_by!(name: space_attrs[:name]) do |space|
    space.assign_attributes(space_attrs.except(:name))
  end
end

puts "Created #{Space.count} spaces"
