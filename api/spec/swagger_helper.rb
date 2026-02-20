# frozen_string_literal: true

require "rails_helper"

RSpec.configure do |config|
  # Specify a root folder where Swagger JSON files are generated
  # NOTE: If you're using the rswag-api to serve API descriptions, you'll need
  # to ensure that it's configured to serve Swagger from the same folder
  config.openapi_root = Rails.root.join("swagger").to_s

  # Define one or more Swagger documents and provide global metadata for each one
  # When you run the "rswag:specs:swaggerize" rake task, the complete Swagger will
  # be generated at the provided relative path under openapi_root
  # By default, the operations defined in spec files are added to the first
  # document below. You can override this behavior by adding a openapi_spec tag to the
  # the root example_group in your specs, e.g. describe "...", openapi_spec: "v2/swagger.json"
  config.openapi_specs = {
    "v1/swagger.yaml" => {
      openapi: "3.0.1",
      info: {
        title: "予約アプリ API",
        version: "v1",
        description: "予約アプリのREST API"
      },
      paths: {},
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server"
        }
      ],
      components: {
        schemas: {
          User: {
            type: :object,
            properties: {
              id: { type: :integer },
              name: { type: :string },
              email: { type: :string, format: :email },
              admin: { type: :boolean }
            },
            required: %w[ id name email admin ]
          },
          UserInput: {
            type: :object,
            properties: {
              user: {
                type: :object,
                properties: {
                  name: { type: :string },
                  email: { type: :string, format: :email },
                  password: { type: :string, minLength: 6 },
                  password_confirmation: { type: :string }
                },
                required: %w[ name email password password_confirmation ]
              }
            },
            required: %w[ user ]
          },
          LoginInput: {
            type: :object,
            properties: {
              email: { type: :string, format: :email },
              password: { type: :string }
            },
            required: %w[ email password ]
          },
          Error: {
            type: :object,
            properties: {
              error: { type: :string }
            }
          },
          ValidationErrors: {
            type: :object,
            properties: {
              errors: {
                type: :array,
                items: { type: :string }
              }
            }
          },
          CsrfToken: {
            type: :object,
            properties: {
              csrf_token: { type: :string }
            },
            required: %w[ csrf_token ]
          },
          Space: {
            type: :object,
            properties: {
              id: { type: :integer },
              name: { type: :string },
              description: { type: :string, nullable: true },
              capacity: { type: :integer, nullable: true },
              price: { type: :string, nullable: true },
              address: { type: :string, nullable: true }
            },
            required: %w[ id name ]
          },
          Event: {
            type: :object,
            properties: {
              id: { type: :integer },
              name: { type: :string },
              description: { type: :string, nullable: true },
              starts_at: { type: :string, format: "date-time" },
              ends_at: { type: :string, format: "date-time" },
              space_id: { type: :integer },
              status: { type: :string, enum: %w[pending approved rejected] },
              space: {
                type: :object,
                properties: {
                  id: { type: :integer },
                  name: { type: :string }
                },
                required: %w[ id name ]
              }
            },
            required: %w[ id name starts_at ends_at space_id status space ]
          },
          EventInput: {
            type: :object,
            properties: {
              event: {
                type: :object,
                properties: {
                  name: { type: :string },
                  description: { type: :string },
                  starts_at: { type: :string, format: "date-time" },
                  ends_at: { type: :string, format: "date-time" },
                  space_id: { type: :integer }
                },
                required: %w[ name starts_at ends_at space_id ]
              }
            },
            required: %w[ event ]
          }
        }
      }
    }
  }

  # Specify the format of the output Swagger file when running "rswag:specs:swaggerize".
  # The openapi_specs configuration option has the filename including format in
  # the key, this may want to be changed to avoid putting yaml in json files.
  # Defaults to json. Accepts ":json" and ":yaml".
  config.openapi_format = :yaml
end
