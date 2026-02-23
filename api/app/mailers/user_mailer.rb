class UserMailer < ApplicationMailer
  def welcome(user)
    @user = user
    mail(to: @user.email, subject: "施設予約アプリへようこそ！")
  end

  def booking_request(event)
    @event = event
    @user = event.user
    mail(to: @user.email, subject: "予約申請を受け付けました - #{@event.name}")
  end

  def booking_approved(event)
    @event = event
    @user = event.user
    mail(to: @user.email, subject: "予約が承認されました - #{@event.name}")
  end

  def booking_rejected(event)
    @event = event
    @user = event.user
    mail(to: @user.email, subject: "予約が却下されました - #{@event.name}")
  end
end
