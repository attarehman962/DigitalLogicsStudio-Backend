const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Digital Logics Studio API",
      version: "1.0.0",
      description:
        "REST API for Digital Logics Studio — handles authentication and user progress tracking.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
            name: { type: "string", example: "Saad Amin" },
            email: { type: "string", example: "saad@example.com" },
            solvedProblems: {
              type: "array",
              items: { type: "integer" },
              example: [1, 3, 7],
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            stack: {
              type: "string",
              description: "Only present in development mode",
            },
          },
        },
      },
      // Note: auth uses httpOnly cookies — no Bearer token needed in Swagger.
      // The /api/auth/login endpoint sets the cookie automatically.
      // To test protected routes in Swagger UI, first call /api/auth/login,
      // then the browser session cookie will be forwarded on subsequent requests
      // (works when Swagger UI is on the same origin as the API).
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
