import { NextResponse } from "next/server";
import supabase from "@/lib/db";

export async function POST(req) {
  try {
    const { email, token } = await req.json();

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email"
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: data.user,
        session: data.session
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}