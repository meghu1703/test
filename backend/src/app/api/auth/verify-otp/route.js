import supabase from "@/lib/db";
import { findUserByEmail, markUserVerified } from "@/lib/users";
import { errorResponse, successResponse } from "@/lib/responses";
import { normalizeEmail, isValidEmail } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    // ✅ Safe JSON parsing
    let body;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const rawEmail = body?.email;
    const rawToken = body?.token;

    // ✅ Validation
    if (typeof rawEmail !== "string" || !rawEmail.trim()) {
      return errorResponse("Email is required", 400);
    }

    if (typeof rawToken !== "string" || !rawToken.trim()) {
      return errorResponse("OTP token is required", 400);
    }

    const email = normalizeEmail(rawEmail);
    const token = rawToken.trim();

    if (!isValidEmail(email)) {
      return errorResponse("Please enter a valid email address", 400);
    }

    // ✅ OTP format check (6 digit)
    if (!/^\d{6}$/.test(token)) {
      return errorResponse("Invalid OTP format", 400);
    }

    // ✅ FIXED: correct OTP type
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup" // 🔥 important fix
    });

    if (error || !data?.user) {
      return errorResponse(error?.message || "Invalid or expired OTP", 401);
    }

    // ✅ Store session in cookie (IMPORTANT for auth persistence)
    if (data?.session?.access_token) {
      const cookieStore = await cookies();

      cookieStore.set("token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/"
      });
    }

    // ✅ Check user in DB
    const { data: existingUser, error: lookupError } = await findUserByEmail(email);

    if (lookupError) {
      console.error("verify-otp lookup error", lookupError);
      return errorResponse("Unable to load user profile", 500);
    }

    let profile = existingUser;

    // ✅ Mark verified if needed
    if (existingUser && !existingUser.ravji_id) {
      const { data: verifiedUser, error: updateError } = await markUserVerified(email);

      if (updateError) {
        console.error("verify-otp update error", updateError);
        return errorResponse("Unable to update user profile", 500);
      }

      profile = verifiedUser;
    }

    // ✅ Final response
    return successResponse(
      {
        user: data.user,
        profile,
        userExists: Boolean(existingUser),
        requiresRegistration: !existingUser,
        nextStep: existingUser ? "home" : "register"
      },
      200
    );

  } catch (error) {
    console.error("verify-otp error", error);
    return errorResponse("Server error", 500);
  }
}
