const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Auth OTP API Documentation",
      version: "1.0.0",
      description:
        "Professional API documentation for OTP Authentication backend.",
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
      {
        name: "Auth",
        description: "Authentication APIs"
      },
      {
        name: "Health",
        description: "Server Health APIs"
      }
    ],

    paths: {
      "/api/auth/send-otp": {
        post: {
          tags: ["Auth"],
          summary: "Send OTP",
          description: "Send one-time password (OTP) to user's email.",

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
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            },

            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },

            500: {
              description: "Internal Server Error"
            }
          }
        }
      },

      "/api/auth/verify-otp": {
        post: {
          tags: ["Auth"],
          summary: "Verify OTP",
          description: "Verify OTP entered by user.",

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
                    $ref: "#/components/schemas/VerifySuccessResponse"
                  }
                }
              }
            },

            401: {
              description: "Invalid OTP",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse"
                  }
                }
              }
            },

            500: {
              description: "Internal Server Error"
            }
          }
        }
      },

      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health Check",
          description: "Check if server is running.",

          responses: {
            200: {
              description: "Server running successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      }
    },

    components: {
      schemas: {
        SendOtpRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              example: "user@example.com"
            }
          }
        },

        VerifyOtpRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: {
              type: "string",
              example: "user@example.com"
            },
            otp: {
              type: "string",
              example: "123456"
            }
          }
        },

        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true
            },
            message: {
              type: "string",
              example: "Success"
            }
          }
        },

        VerifySuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true
            },
            message: {
              type: "string",
              example: "OTP verified successfully"
            }
          }
        },

        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false
            },
            message: {
              type: "string",
              example: "Invalid or expired OTP"
            }
          }
        }
      }
    }
  },

  apis: ["./routes/*.js"]
};

module.exports = swaggerJsdoc(options);