import scalekit from "@/lib/scalekit";
//import { assertScalekitEnv } from "@/lib/scalekit-env";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Ensure all required Scalekit environment variables are present.
    // Throws an error if any required variable is missing.
   // assertScalekitEnv();

    // Generate a cryptographically secure random string.
    // Used as the OAuth state parameter to protect against CSRF attacks.
    const state = crypto.randomBytes(16).toString("hex");

    // Store the state value in an HTTP-only cookie.
    // During the callback, we'll compare this cookie with the returned state
    // to verify the request originated from our application.
    (await cookies()).set("sk_state", state, {
      httpOnly: true, // Prevent JavaScript access
      sameSite: "lax", // Helps protect against CSRF
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      path: "/", // Available throughout the application
      maxAge: 60 * 10, // Expires after 10 minutes
    });

    // OAuth callback URL registered in the Scalekit dashboard.
    // After successful authentication, the user will be redirected here.
    const redirectUri = process.env.SCALEKIT_REDIRECT_URI!;

    // Optional "next" query parameter.
    // Example:
    // /api/auth/login?next=/dashboard
    const next = req.nextUrl.searchParams.get("next");

    // Prevent open redirect attacks.
    // Only allow internal routes beginning with "/".
    const nextParam =
      next?.startsWith("/") && !next.startsWith("//") ? next : undefined;

    // Parameters passed to the authorization server.
    const options = {
      // OpenID Connect scopes requesting user information.
      scopes: ["openid", "profile", "email", "offline_access"],

      // Include the generated state so it is returned unchanged
      // in the callback for verification.
      state,
    };

    // Generate the OAuth authorization URL.
    // Example:
    // https://<scalekit-domain>/authorize?client_id=...&state=...
    const authorizationUrl = scalekit.getAuthorizationUrl(
      redirectUri,
      options
    );

    // Redirect the user's browser to Scalekit for login.
    const response = NextResponse.redirect(authorizationUrl);

    // If a valid "next" path was provided,
    // save it so we can redirect the user after login.
    if (nextParam) {
      response.cookies.set("sk_next", nextParam, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 10,
      });
    }

    // Send the redirect response.
    return response;
  } catch (error) {
    console.log(error);

    // Return an error response if authorization URL generation fails.
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}