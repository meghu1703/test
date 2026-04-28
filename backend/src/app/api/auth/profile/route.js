import { getAuthenticatedUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/responses";
import { findUserByEmail } from "@/lib/users";

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function GET(req) {
  try {
    const { user, error } = await getAuthenticatedUser(req);

    if (error || !user?.email) {
      return errorResponse("Unauthorized", 401);
    }

    const { data, error: dbError } = await findUserByEmail(user.email);

    if (dbError) {
      console.error("profile fetch error", dbError);
      return errorResponse("Unable to load profile", 500);
    }

    return successResponse({
      user: {
        id: user.id,
        email: user.email
      },
      profile: data || null,
      requiresRegistration: !data
    });
  } catch (error) {
    console.error("profile error", error);
    return errorResponse("Server error", 500);
  }
}
