import { getAuthenticatedUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/responses";
import {
  createUserProfile,
  findUserByEmail,
  updateUserProfile
} from "@/lib/users";

export async function POST(req) {
  try {
    const { user, error } = await getAuthenticatedUser(req);

    if (error || !user?.email) {
      return errorResponse("Unauthorized", 401);
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const name = body?.name?.trim?.();

    if (!name) {
      return errorResponse("Name is required", 400);
    }

    const { data: existingUser, error: lookupError } = await findUserByEmail(
      user.email
    );

    if (lookupError) {
      console.error("lookup error", lookupError);
      return errorResponse("Database error", 500);
    }

    if (existingUser) {
      const { data, error: updateError } = await updateUserProfile({
        email: user.email,
        fullName: name
      });

      if (updateError) {
        console.error("update error", updateError);
        return errorResponse("Unable to update profile", 500);
      }

      return successResponse(
        {
          profile: data,
          nextStep: "home"
        },
        200
      );
    }

    const { data, error: createError } = await createUserProfile({
      email: user.email,
      fullName: name,
      userId: user.id
    });

    if (createError) {
      console.error("create error", createError);
      return errorResponse("Unable to create profile", 500);
    }

    return successResponse(
      {
        profile: data,
        nextStep: "home"
      },
      201
    );
  } catch (error) {
    console.error("register error", error);
    return errorResponse("Server error", 500);
  }
}
