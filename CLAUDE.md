# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a reservation/booking application (yoyaku_app) with a Rails API backend and Next.js frontend. The application manages spaces, events, users, and event participations.

## Repository Structure

This is a monorepo with two main applications:
- `api/` - Rails 8.1 API-only backend
- `frontend/` - Next.js 16.1 frontend with TypeScript and Tailwind CSS

### Backend (Rails API)

**Tech Stack:**
- Rails 8.1.2 API-only
- PostgreSQL database
- RSpec for testing with FactoryBot, Faker, and Shoulda-Matchers
- Rswag for Swagger/OpenAPI documentation (served at `/api-docs`)
- BCrypt for password authentication

**Domain Models:**
- `User` - Has secure password, email (unique), name
- `Space` - Rental spaces with name, description, address, capacity, price
- `Event` - Bookings with name, description, starts_at, ends_at (belongs to Space and User)
- `EventParticipation` - Join table linking Users to Events

**API Endpoints:**
- Authentication: `POST /signup`, `POST /login`, `DELETE /logout`, `GET /me`
- CSRF: `GET /csrf`
- Home: `GET /home`
- Resources: `/spaces` (index, show), `/events` (index, show, create, update, destroy)

### Frontend (Next.js)

**Tech Stack:**
- Next.js 16.1 with App Router
- React 19.2
- TypeScript
- Tailwind CSS 4

**Structure:**
- `src/app/` - App Router pages
- `src/components/` - React components
- `src/contexts/` - React contexts
- `src/lib/` - Utility libraries
- `src/types/` - TypeScript type definitions

## Development Commands

### Backend (Rails API)

**Working Directory:** `api/`

```bash
# Install dependencies
bundle install

# Database setup
bin/rails db:create
bin/rails db:migrate
bin/rails db:seed

# Start development server (default port 3000)
bin/rails server

# Run all tests
bundle exec rspec

# Run specific test file
bundle exec rspec spec/path/to/file_spec.rb

# Run specific test by line number
bundle exec rspec spec/path/to/file_spec.rb:42

# Run linter
bundle exec rubocop

# Run security audit
bundle exec brakeman
bundle exec bundler-audit check --update

# Generate Swagger documentation
SWAGGER_DRY_RUN=0 bundle exec rake rswag:specs:swaggerize

# Rails console
bin/rails console

# Database rollback
bin/rails db:rollback

# Database reset
bin/rails db:reset
```

### Frontend (Next.js)

**Working Directory:** `frontend/`

```bash
# Install dependencies
npm install

# Start development server (port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Database

**Database:** PostgreSQL

**Databases:**
- Development: `api_development`
- Test: `api_test`

Schema includes foreign key constraints and unique indexes. See `api/db/schema.rb` for current schema.

## Testing

### Backend Testing

Tests are organized in `api/spec/`:
- `spec/models/` - Model tests
- `spec/requests/` - API endpoint tests
- `spec/integration/` - Integration tests
- `spec/factories/` - FactoryBot factories for test data

**Test Helpers:**
- RSpec with `--format documentation` by default
- FactoryBot for fixtures
- Faker for realistic fake data
- DatabaseCleaner for test isolation
- Shoulda-Matchers for common assertions
- Rswag for API documentation tests

**Running Tests:**
- All tests: `bundle exec rspec`
- Single file: `bundle exec rspec spec/models/user_spec.rb`
- Single test: `bundle exec rspec spec/models/user_spec.rb:10`

## Authentication

The API uses session-based authentication:
- Passwords are secured with BCrypt
- Sessions are managed through Rails sessions
- CSRF protection is enabled (get token from `/csrf`)
- Current user endpoint: `GET /me`

## API Documentation

Swagger/OpenAPI documentation is available via Rswag:
- UI: Available at `/api-docs` when server is running
- Specs: `api/spec/integration/` contains Rswag request specs
- Config: `api/spec/swagger_helper.rb`

## Code Style

**Backend:**
- Follow RuboCop Rails Omakase style guide
- Configuration in `api/.rubocop.yml`

**Frontend:**
- ESLint configuration in `frontend/eslint.config.mjs`

## Key Architectural Patterns

1. **API-only Rails Backend**: No views, returns JSON responses
2. **CORS Enabled**: Frontend and backend run on different ports in development
3. **Next.js App Router**: Using the modern App Router pattern (not Pages Router)
4. **Type Safety**: TypeScript on frontend for type safety
5. **Test-First Approach**: Comprehensive RSpec test suite with integration tests
