import { getAuthenticatedUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/responses";
import { findUserByEmail } from "@/lib/users";

export async function GET(req) {
  try {
    const { user, error } = await getAuthenticatedUser(req);

    if (error || !user?.email) {
      return errorResponse(error || "Unauthorized", 401);
    }

    const { data, error: lookupError } = await findUserByEmail(user.email);

    if (lookupError) {
      console.error("profile lookup error", lookupError);
      return errorResponse("Unable to load profile", 500);
    }

    return successResponse(
      {
        user,
        profile: data,
        requiresRegistration: !data
      },
      200
    );
  } catch (error) {
    console.error("profile error", error);
    return errorResponse("Server error", 500);
  }
}
