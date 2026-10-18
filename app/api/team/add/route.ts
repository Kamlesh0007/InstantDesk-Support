import { db } from "@/db/client";
import { teamMembers } from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import scalekit from "@/lib/scalekit";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // ----------------------------------------
    // Authenticate the current user
    // ----------------------------------------
    const LoggedInUser = await isAuthorized();

    // Return 401 if the user is not authenticated
    if (!LoggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ----------------------------------------
    // Extract request payload
    // ----------------------------------------
    const { email, name } = await req.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // Check whether the user has already been
    // invited to the organization
    // ----------------------------------------
    const pendingTeamMember = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.user_email, email));

    if (pendingTeamMember.length > 0) {
      return NextResponse.json(
        { error: "User is already invited" },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // Create the user in Scalekit and send
    // an invitation email
    // ----------------------------------------
    const { user } = await scalekit.user.createUserAndMembership(
      LoggedInUser.organization_id,
      {
        email,
        userProfile: {
          firstName: name || email.split("@")[0],
          lastName: "",
        },
        sendInvitationEmail: true,
      }
    );

    // ----------------------------------------
    // Store the invited member in the local
    // database for future management
    // ----------------------------------------
    await db.insert(teamMembers).values({
      user_email: email,
      name: name || email.split("@")[0],
      organization_id: LoggedInUser.organization_id,
    });

    // Return the created user details
    return NextResponse.json({ user });
  } catch (error) {
    // Log unexpected server errors
    console.error("Failed to add team member:", error);

    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}