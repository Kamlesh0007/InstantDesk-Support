import { db } from "@/db/client";
import { knowledge_source } from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


const VALID_STATUSES = new Set(["active", "excluded"]);

export async function PATCH(req: NextRequest) {
  try {
    const user = await isAuthorized();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [updated] = await db
      .update(knowledge_source)
      .set({ status, last_updated: sql`now()` })
      .where(
        and(
          eq(knowledge_source.id, id),
          eq(knowledge_source.user_email, user.email)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    return NextResponse.json({ source: updated }, { status: 200 });
  } catch (error) {
    console.error("Failed to update knowledge source:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}