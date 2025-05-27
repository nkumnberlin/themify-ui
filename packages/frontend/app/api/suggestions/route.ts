import { NextResponse } from "next/server";
import { getGroupedProjectFolders } from "@/services/project-folders";

export async function GET() {
  const grouped = await getGroupedProjectFolders();
  return NextResponse.json(grouped);
}
