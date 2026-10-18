import { db } from "@/db/client";
import { teamMembers } from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    // Authenticate user
    const user = await isAuthorized();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Read request body
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Member id is required." },
        { status: 400 }
      );
    }

    // Delete only if the member belongs to the user's organization
    const deletedMember = await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, id),
          eq(teamMembers.organization_id, user.organization_id)
        )
      )
      .returning();

    if (deletedMember.length === 0) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Team member deleted successfully.",
    });
  } catch (error) {
    console.error("Delete member error:", error);

    return NextResponse.json(
      { error: "Failed to delete team member." },
      { status: 500 }
    );
  }
}