import supabase from "@/lib/db";
import { findUserByEmail, markUserVerified } from "@/lib/users";
import { errorResponse, successResponse } from "@/lib/responses";
import { normalizeEmail, isValidEmail } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
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

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email"
    });

    if (error) {
      return errorResponse(error.message, 401);
    }

    const { data: existingUser, error: lookupError } = await findUserByEmail(
      email
    );

    if (lookupError) {
      console.error("verify-otp lookup error", lookupError);
      return errorResponse("Unable to load user profile", 500);
    }

    let profile = existingUser;

    if (existingUser && !existingUser.is_verified) {
      const { data: verifiedUser, error: updateError } = await markUserVerified(
        email
      );

      if (updateError) {
        console.error("verify-otp update error", updateError);
        return errorResponse("Unable to update user profile", 500);
      }

      profile = verifiedUser;
    }

    return successResponse(
      {
        user: data.user,
        session: data.session,
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
