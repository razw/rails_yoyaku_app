# Cookie-based sessions for cross-origin frontend (e.g. Next.js)
# Configure these env vars per environment:
# - SESSION_COOKIE_KEY
# - SESSION_COOKIE_DOMAIN
# - SESSION_COOKIE_SAME_SITE (none|lax|strict)
# - SESSION_COOKIE_SECURE (true|false)
Rails.application.config.session_store :cookie_store,
  key: ENV.fetch("SESSION_COOKIE_KEY", "_api_session"),
  domain: ENV["SESSION_COOKIE_DOMAIN"],
  same_site: ENV.fetch("SESSION_COOKIE_SAME_SITE", Rails.env.production? ? "none" : "lax").to_sym,
  secure: ENV.fetch("SESSION_COOKIE_SECURE", Rails.env.production? ? "true" : "false") == "true"
