import supabase from "@/lib/db";

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getAccessToken(request) {
  const authorization = request.headers.get("authorization") || "";

  if (authorization.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length).trim();

    return token || null;
  }

  return request.cookies.get("token")?.value || null;
}

export async function getAuthenticatedUser(request) {
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    return {
      accessToken: null,
      user: null,
      error: "Missing bearer token"
    };
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return {
      accessToken,
      user: null,
      error: error?.message || "Invalid or expired session"
    };
  }

  return {
    accessToken,
    user: data.user,
    error: null
  };
}
