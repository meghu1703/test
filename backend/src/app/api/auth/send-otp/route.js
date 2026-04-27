import supabase from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizeEmail, isValidEmail } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/responses";

export async function POST(req) {
  try {
    const body = await req.json();
    const rawEmail = body?.email;

    if (typeof rawEmail !== "string" || !rawEmail.trim()) {
      return errorResponse("Email is required", 400);
    }

    const email = normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      return errorResponse("Please enter a valid email address", 400);
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const emailLimit = checkRateLimit(`otp:email:${email}`, 3, 10 * 60 * 1000);
    const ipLimit = checkRateLimit(`otp:ip:${ipAddress}`, 10, 10 * 60 * 1000);

    if (!emailLimit.allowed || !ipLimit.allowed) {
      return errorResponse(
        "Too many OTP requests. Please wait a few minutes and try again.",
        429
      );
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    });

    if (error) {
      return errorResponse(error.message, 401);
    }

    return successResponse(
      { message: "OTP sent successfully" },
      200
    );
  } catch (error) {
    console.error("send-otp error", error);
    return errorResponse("Server error", 500);
  }
}
