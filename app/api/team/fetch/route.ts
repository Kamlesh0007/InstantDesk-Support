import { db } from "@/db/client";
import { teamMembers } from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ----------------------------------------
    // Authenticate the current user
    // ----------------------------------------
    const user = await isAuthorized();

    // Return 401 if the user is not logged in
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ----------------------------------------
    // Fetch all team members belonging to the
    // authenticated user's organization
    // ----------------------------------------
    const teamMembersData = await db
      .select({
        id: teamMembers.id,
        name: teamMembers.name,
        user_email: teamMembers.user_email,
        role: teamMembers.role,
        status: teamMembers.status,
        created_at: teamMembers.created_at,
      })
      .from(teamMembers)
      .where(eq(teamMembers.organization_id, user.organization_id));

    // Return team member list
    return NextResponse.json({
      team: teamMembersData,
    });
  } catch (error) {
    // Log unexpected server errors
    console.error("Failed to fetch team members:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch team members",
      },
      {
        status: 500,
      }
    );
  }
}