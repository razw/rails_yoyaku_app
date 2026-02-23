# frozen_string_literal: true

module Events
  class CreateService
    def initialize(user, params)
      @user = user
      @params = params
    end

    def call
      event = @user.organized_events.build(@params)
      event.status = :approved if @user.admin?

      if event.save
        deliver_mail(event)
      end

      event
    end

    private

    def deliver_mail(event)
      if @user.admin?
        UserMailer.booking_approved(event).deliver_later
      else
        UserMailer.booking_request(event).deliver_later
      end
    end
  end
end
