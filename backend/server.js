const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/swagger");

const app = express();

/* ================= CORS ================= */
const defaultOrigins = [
  "http://localhost:3000",
  "https://ai-gw92oeygi-poojasindhi2004s-projects.vercel.app",
  "https://test-q6ja.onrender.com"
];

function normalizeOrigin(origin) {
  return origin.replace(/\/$/, "");
}

function normalizeConfiguredOrigin(origin) {
  const value = origin.trim();

  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return normalizeOrigin(value);
  }

  return normalizeOrigin(`https://${value}`);
}

const allowedOrigins = new Set([
  ...defaultOrigins,
  ...[
    process.env.CORS_ALLOWED_ORIGINS,
    process.env.FRONTEND_URL,
    process.env.FRONTEND_ORIGIN,
    process.env.NEXT_PUBLIC_FRONTEND_URL,
    process.env.RENDER_EXTERNAL_URL,
    process.env.URL,
    process.env.VERCEL_URL
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map(normalizeConfiguredOrigin)
    .filter(Boolean)
]);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(normalizeOrigin(origin))) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked: " + origin));
    }
  },
  credentials: true
}));

// Handle preflight
app.options(/.*/, cors());

/* ================= MIDDLEWARE ================= */
app.use(express.json());

/* ================= SWAGGER ================= */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ================= TEST ROUTE ================= */
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working" });
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({
    success: false,
    message: err.message
  });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
