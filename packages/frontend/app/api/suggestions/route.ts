import { NextResponse } from "next/server";
import { getGroupedProjectEntries } from "@/services/project-folders";

export async function GET() {
  const grouped = getGroupedProjectEntries();
  return NextResponse.json(grouped);
}
