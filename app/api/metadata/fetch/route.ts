import { db } from "@/db/client";
import { metadata } from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Handles GET /api/metadata
// Returns the authenticated user's organization metadata.
// It first checks cookies for faster access and falls back to the database.
export async function GET(request: Request) {
  try {
    // Verify the user is authenticated.
    const user = await isAuthorized();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Read cookies from the incoming request.
    const cookieStore = await cookies();

    // Check if metadata already exists in cookies.
    // Using cookies avoids unnecessary database queries.
    const metadataCookie = cookieStore.get("metadata");

    if (metadataCookie?.value) {
      return NextResponse.json(
        {
          exists: true,
          source: "cookie", // Indicates data came from cookie.
          data: JSON.parse(metadataCookie.value),
        },
        { status: 200 }
      );
    }

    // Cookie doesn't exist.
    // Fetch organization metadata from the database.
    const [record] = await db
      .select()
      .from(metadata)
      .where(eq(metadata.user_email, user.email));

    // Metadata found in database.
    if (record) {

      // Cache metadata in a cookie.
      // Future requests can skip the database lookup.
      cookieStore.set(
        "metadata",
        JSON.stringify({
          business_name: record.business_name,
        }),
        {
          httpOnly: true, // Prevent JavaScript access.
          secure: process.env.NODE_ENV === "production", // HTTPS only in production.
          maxAge: 60 * 60 * 24 * 30, // Cookie expires after 30 days.
          path: "/", // Accessible throughout the application.
        }
      );

      return NextResponse.json(
        {
          exists: true,
          source: "database", // Indicates data came from database.
          data: record,
        },
        { status: 200 }
      );
    }

    // No metadata found.
    // User has likely not completed onboarding.
    return NextResponse.json(
      {
        exists: false,
        data: null,
      },
      { status: 200 }
    );

  } catch (error) {

    // Log unexpected server errors.
    console.error("Metadata fetch error:", error);

    // Return generic server error.
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}