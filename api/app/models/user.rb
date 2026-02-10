class User < ApplicationRecord
  has_secure_password

  has_many :event_participations, dependent: :destroy
  has_many :events, through: :event_participations

  before_validation :normalize_email

  validates :name, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false }

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end
end
