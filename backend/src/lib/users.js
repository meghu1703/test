import { getDatabaseClient, supabaseAdmin } from "@/lib/db";

const USERS_TABLE = "profile";

function getUsersClient() {
  return getDatabaseClient();
}

export async function findUserByEmail(email) {
  const client = getUsersClient();

  const { data, error } = await client
    .from(USERS_TABLE)
    .select("id, name, email, ravji_id, created_at")
    .eq("email", email)
    .maybeSingle();

  return { data, error };
}

export async function markUserVerified(email) {
  return findUserByEmail(email);
}

export async function createUserProfile({ email, fullName, userId }) {
  const client = getUsersClient();

  const payload = {
    email,
    name: fullName,
    ravji_id: userId
  };

  const { data, error } = await client
    .from(USERS_TABLE)
    .insert(payload)
    .select("id, name, email, ravji_id, created_at")
    .single();

  return { data, error };
}

export async function updateUserProfile({ email, fullName }) {
  const client = getUsersClient();

  const { data, error } = await client
    .from(USERS_TABLE)
    .update({
      name: fullName,
      updated_at: new Date().toISOString()
    })
    .eq("email", email)
    .select("id, name, email, ravji_id, created_at")
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
