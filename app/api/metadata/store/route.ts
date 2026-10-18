import { db } from "@/db/client";
import { metadata } from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  isValidBusinessName,
  isValidUrl,
  isValidExternalLinks,
} from "@/lib/validators";

// Handles POST /api/metadata/store
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await isAuthorized();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const {
      business_name,
      website_url,
      external_links = "",
    } = await req.json();

    // Trim input values
    const businessName = business_name?.trim();
    const websiteUrl = website_url?.trim();
    const externalLinks = external_links?.trim();

    // Required fields
    if (!businessName || !websiteUrl) {
      return NextResponse.json(
        {
          error: "Business name and website URL are required.",
        },
        { status: 400 }
      );
    }

    // Validate business name
    if (!isValidBusinessName(businessName)) {
      return NextResponse.json(
        {
          error:
            "Business name must be 2-100 characters and contain only letters, numbers, spaces and common symbols.",
        },
        { status: 400 }
      );
    }

    // Validate website
    if (!isValidUrl(websiteUrl)) {
      return NextResponse.json(
        {
          error: "Please enter a valid website URL.",
        },
        { status: 400 }
      );
    }

    // Validate external links
    if (!isValidExternalLinks(externalLinks)) {
      return NextResponse.json(
        {
          error:
            "One or more external links are invalid.",
        },
        { status: 400 }
      );
    }

    // Store metadata
    const metadataResponse = await db.insert(metadata).values({
      user_email: user.email,
      business_name: businessName,
      website_url: websiteUrl,
      external_links: externalLinks,
    });

    // Cache metadata in cookie
    const cookieStore = await cookies();

    cookieStore.set(
      "metadata",
      JSON.stringify({
        business_name: businessName,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Organization metadata stored successfully.",
        metadataResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Metadata Store Error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}