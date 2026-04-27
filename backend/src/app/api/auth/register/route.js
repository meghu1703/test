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
      return errorResponse(error || "Unauthorized", 401);
    }

    const body = await req.json();
    const fullName = body?.full_name?.trim();

    if (!fullName) {
      return errorResponse("Full name is required", 400);
    }

    const { data: existingUser, error: lookupError } = await findUserByEmail(
      user.email
    );

    if (lookupError) {
      console.error("register lookup error", lookupError);
      return errorResponse("Unable to load user profile", 500);
    }

    if (existingUser) {
      const { data, error: updateError } = await updateUserProfile({
        email: user.email,
        fullName
      });

      if (updateError) {
        console.error("register update error", updateError);
        return errorResponse("Unable to update user profile", 500);
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
      fullName
    });

    if (createError) {
      console.error("register create error", createError);
      return errorResponse("Unable to create user profile", 500);
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
