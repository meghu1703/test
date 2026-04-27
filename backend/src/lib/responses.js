import { NextResponse } from "next/server";

export function errorResponse(message, status = 400, details) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(details ? { details } : {})
    },
    { status }
  );
}

export function successResponse(data, status = 200) {
  return NextResponse.json(
    {
      success: true,
      ...data
    },
    { status }
  );
}
