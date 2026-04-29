import supabase from "@/lib/db";
import { normalizeEmail, isValidEmail } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/responses";
import { findUserByEmail, markUserVerified } from "@/lib/users";

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const rawEmail = body?.email;
    const rawToken = body?.token;

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

    if (!/^\d{6}$/.test(token)) {
      return errorResponse("Invalid OTP format", 400);
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email"
    });

    if (error || !data?.user) {
      return errorResponse(error?.message || "Invalid or expired OTP", 401);
    }

    const { data: existingUser, error: lookupError } = await findUserByEmail(email);

    if (lookupError) {
      console.error("verify-otp lookup error", lookupError);
      return errorResponse("Unable to load user profile", 500);
    }

    let profile = existingUser;

    if (existingUser && !existingUser.ravji_id) {
      const { data: verifiedUser, error: updateError } = await markUserVerified(
        email,
        data.user.id
      );

      if (updateError) {
        console.error("verify-otp update error", updateError);
        return errorResponse("Unable to update user profile", 500);
      }

      profile = verifiedUser;
    }

    const response = successResponse(
      {
        user: data.user,
        profile,
        userExists: Boolean(existingUser),
        requiresRegistration: !existingUser,
        nextStep: existingUser ? "home" : "register"
      },
      200
    );

    if (data.session?.access_token) {
      response.cookies.set("token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/"
      });
    }

    return response;
  } catch (error) {
    console.error("verify-otp error", error);
    return errorResponse("Server error", 500);
  }
}
