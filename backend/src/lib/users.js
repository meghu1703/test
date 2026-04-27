import { getDatabaseClient, supabaseAdmin } from "@/lib/db";

const USERS_TABLE = "users";

function getUsersClient() {
  return getDatabaseClient();
}

export async function findUserByEmail(email) {
  const client = getUsersClient();

  const { data, error } = await client
    .from(USERS_TABLE)
    .select("id, email, full_name, mobile, is_verified, created_at")
    .eq("email", email)
    .maybeSingle();

  return { data, error };
}

export async function markUserVerified(email) {
  const client = getUsersClient();

  const { data, error } = await client
    .from(USERS_TABLE)
    .update({ is_verified: true })
    .eq("email", email)
    .select("id, email, full_name, mobile, is_verified, created_at")
    .maybeSingle();

  return { data, error };
}

export async function createUserProfile({ email, fullName }) {
  const client = getUsersClient();

  const payload = {
    email,
    full_name: fullName,
    is_verified: true
  };

  const { data, error } = await client
    .from(USERS_TABLE)
    .insert(payload)
    .select("id, email, full_name, mobile, is_verified, created_at")
    .single();

  return { data, error };
}

export async function updateUserProfile({ email, fullName }) {
  const client = getUsersClient();

  const { data, error } = await client
    .from(USERS_TABLE)
    .update({
      full_name: fullName,
      is_verified: true
    })
    .eq("email", email)
    .select("id, email, full_name, mobile, is_verified, created_at")
    .single();

  return { data, error };
}

export async function revokeUserSessions(accessToken) {
  if (!supabaseAdmin) {
    return {
      error: null
    };
  }

  const { error } = await supabaseAdmin.auth.admin.signOut(
    accessToken,
    "global"
  );

  return { error };
}
