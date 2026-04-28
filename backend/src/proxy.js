import { NextResponse } from "next/server";

const defaultOrigins = [
  "http://localhost:3000",
  "https://ai-gw92oeygi-poojasindhi2004s-projects.vercel.app"
];

function normalizeOrigin(origin) {
  return origin.replace(/\/$/, "");
}

function getAllowedOrigins() {
  const configuredOrigins = [
    process.env.CORS_ALLOWED_ORIGINS,
    process.env.FRONTEND_URL,
    process.env.FRONTEND_ORIGIN,
    process.env.NEXT_PUBLIC_FRONTEND_URL
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map((value) => normalizeOrigin(value.trim()))
    .filter(Boolean);

  return new Set([...defaultOrigins, ...configuredOrigins]);
}

function applyCorsHeaders(response, origin, requestHeaders) {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    requestHeaders || "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Vary", "Origin");
}

export function proxy(request) {
  const originHeader = request.headers.get("origin");
  const origin = originHeader ? normalizeOrigin(originHeader) : "";
  const allowedOrigins = getAllowedOrigins();
  const isAllowedOrigin = origin ? allowedOrigins.has(origin) : true;
  const requestHeaders = request.headers.get("access-control-request-headers");

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin) {
      return NextResponse.json(
        { success: false, message: "Origin not allowed" },
        { status: 403 }
      );
    }

    const response = new NextResponse(null, { status: 204 });

    if (origin) {
      applyCorsHeaders(response, origin, requestHeaders);
    }

    return response;
  }

  if (!isAllowedOrigin) {
    return NextResponse.json(
      { success: false, message: "Origin not allowed" },
      { status: 403 }
    );
  }

  const response = NextResponse.next();

  if (origin) {
    applyCorsHeaders(response, origin, requestHeaders);
  }

  return response;
}

export const config = {
  matcher: "/api/:path*"
};
