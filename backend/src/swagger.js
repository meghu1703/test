const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth & Profile API Documentation",
      version: "1.0.0",
      description:
        "API documentation for OTP authentication and user profile endpoints.",
      contact: {
        name: "API Support",
        email: "support@example.com"
      }
    },
    servers: [
      {
        url: "https://test-q6ja.onrender.com",
        description: "Production Server"
      },
      {
        url: "http://localhost:3000",
        description: "Local Development Server"
      }
    ],
    tags: [
      { name: "Auth", description: "Authentication APIs" },
      { name: "Profile", description: "User Profile APIs" },
      { name: "Health", description: "Server Health APIs" }
    ],
    paths: {
      "/api/auth/send-otp": {
        post: {
          tags: ["Auth"],
          summary: "Send OTP",
          description: "Send OTP to a user email address.",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SendOtpRequest"
                }
              }
            }
          },
          responses: {
            200: {
              description: "OTP sent successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/MessageResponse"
                  }
                }
              }
            },
            400: { description: "Invalid input" },
            429: { description: "Too many requests" },
            500: { description: "Server error" }
          }
        }
      },
      "/api/auth/verify-otp": {
        post: {
          tags: ["Auth"],
          summary: "Verify OTP",
          description: "Verify OTP and return the authenticated user session state.",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/VerifyOtpRequest"
                }
              }
            }
          },
          responses: {
            200: {
              description: "OTP verified successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/VerifyOtpResponse"
                  }
                }
              }
            },
            400: { description: "Invalid input" },
            401: { description: "Invalid or expired OTP" },
            500: { description: "Server error" }
          }
        }
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register or update profile",
          description: "Creates or updates the authenticated user's profile.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: {
                      type: "string",
                      example: "John Doe"
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: "Profile updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RegisterResponse"
                  }
                }
              }
            },
            201: {
              description: "Profile created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RegisterResponse"
                  }
                }
              }
            },
            400: { description: "Invalid input" },
            401: { description: "Unauthorized" },
            500: { description: "Server error" }
          }
        }
      },
      "/api/auth/profile": {
        get: {
          tags: ["Profile"],
          summary: "Get profile",
          description: "Returns the authenticated user and their profile data.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Profile fetched successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ProfileResponse"
                  }
                }
              }
            },
            401: { description: "Unauthorized" },
            500: { description: "Server error" }
          }
        }
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout",
          description: "Revokes the current session and clears the auth cookie.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Logged out successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/MessageResponse"
                  }
                }
              }
            },
            401: { description: "Unauthorized" },
            500: { description: "Server error" }
          }
        }
      },
      "/api/test": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          security: [],
          responses: {
            200: {
              description: "Server running",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/MessageResponse"
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        SendOtpRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com"
            }
          }
        },
        VerifyOtpRequest: {
          type: "object",
          required: ["email", "token"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com"
            },
            token: {
              type: "string",
              example: "123456"
            }
          }
        },
        MessageResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Success" }
          }
        },
        Profile: {
          type: "object",
          nullable: true,
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            ravji_id: { type: "string", nullable: true },
            created_at: { type: "string", format: "date-time" }
          }
        },
        RegisterResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            profile: {
              $ref: "#/components/schemas/Profile"
            },
            nextStep: {
              type: "string",
              example: "home"
            }
          }
        },
        ProfileResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string", format: "email" }
              }
            },
            profile: {
              $ref: "#/components/schemas/Profile"
            },
            requiresRegistration: {
              type: "boolean"
            }
          }
        },
        VerifyOtpResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            user: {
              type: "object",
              additionalProperties: true
            },
            profile: {
              $ref: "#/components/schemas/Profile"
            },
            userExists: {
              type: "boolean"
            },
            requiresRegistration: {
              type: "boolean"
            },
            nextStep: {
              type: "string",
              example: "register"
            }
          }
        }
      }
    }
  },
  apis: ["./routes/*.js"]
};

module.exports = swaggerJsdoc(options);
