import { NextResponse } from "next/server";

export async function POST(req: Request) {
  {
    const {} = await req.json();
  }
  return NextResponse.json([]);
}
