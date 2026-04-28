import { getAuthenticatedUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/responses";
import { revokeUserSessions } from "@/lib/users";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { accessToken, error } = await getAuthenticatedUser(req);

    if (error || !accessToken) {
      return errorResponse(error || "Unauthorized", 401);
    }

    const { error: revokeError } = await revokeUserSessions(accessToken);

    if (revokeError) {
      console.error("logout revoke error", revokeError);
      return errorResponse("Unable to log out", 500);
    }

    const response = successResponse({ message: "Logged out successfully" }, 200);
    const cookieStore = await cookies();

    cookieStore.delete("token");

    return response;
  } catch (error) {
    console.error("logout error", error);
    return errorResponse("Server error", 500);
  }
}
