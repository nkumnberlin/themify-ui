import { NextResponse } from "next/server";

// tsconfig.path lesen

export async function POST(req: Request) {
  const {} = await req.json();
  return NextResponse.json([]);
}
