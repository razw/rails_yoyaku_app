class User < ApplicationRecord
  has_secure_password

  has_many :organized_events, class_name: "Event", foreign_key: "user_id", dependent: :destroy

  before_validation :normalize_email

  validates :name, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false }

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end
end
