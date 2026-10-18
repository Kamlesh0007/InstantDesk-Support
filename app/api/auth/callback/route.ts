import { db } from "@/db/client";
import scalekit from "@/lib/scalekit";
//import { assertScalekitEnv } from "@/lib/scalekit-env";
import { NextRequest, NextResponse } from "next/server";
import { user as User } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  // Get all query parameters from the callback URL.
  // Example:
  // /api/auth/callback?code=abc123&state=xyz
  const { searchParams } = req.nextUrl;

  // Authorization code returned by Scalekit after successful login.
  const code = searchParams.get("code");

  // OAuth error parameters (if authentication failed).
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  // Present only for IdP-initiated SSO logins.
  const idpInitiatedLogin = searchParams.get("idp_initiated_login");

  // If Scalekit returned an OAuth error, send it back to the client.
  if (error)
    return NextResponse.json({ error, error_description }, { status: 401 });

  // ============================================================
  // Handle IdP-Initiated Login
  // ============================================================
  if (idpInitiatedLogin) {
    try {
      // Validate the IdP login token and extract claims.
      const claims = await scalekit.getIdpInitiatedLoginClaims(
        idpInitiatedLogin
      );

      // OAuth callback URL registered in Scalekit.
      const redirectUri = process.env.SCALEKIT_REDIRECT_URI!;

      // Generate a new CSRF protection state value.
      const state = crypto.randomBytes(16).toString("hex");

      // Generate an authorization URL using the information
      // supplied by the Identity Provider.
      const authorizationUrl = scalekit.getAuthorizationUrl(redirectUri, {
        scopes: ["openid", "profile", "email", "offline_access"],
        state,

        // Pre-fill login information.
        loginHint: claims.login_hint,

        // Organization and connection used for SSO.
        organizationId: claims.organization_id,
        connectionId: claims.connection_id,
      });

      // Redirect the user back into the normal OAuth flow.
      const response = NextResponse.redirect(authorizationUrl);

      // Store the generated state so it can be verified later.
      response.cookies.set("sk_state", state, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });

      return response;
    } catch (err) {
      console.error("Error handling idp_initiated_login:", err);

      return NextResponse.json(
        { error: "Invalid IdP-initiated login token" },
        { status: 401 }
      );
    }
  }

  // OAuth callback must contain an authorization code.
  if (!code)
    return NextResponse.json(
      { error: "No code provided" },
      { status: 400 }
    );

  // ============================================================
  // Verify OAuth State (CSRF Protection)
  // ============================================================

  // State returned by Scalekit.
  const state = searchParams.get("state");

  // Access cookies for this request.
  const cookieStore = await cookies();

  // State stored before redirecting to Scalekit.
  const storedState = cookieStore.get("sk_state")?.value;

  // Reject the request if the state doesn't match.
  if (!state || !storedState || state !== storedState) {
    return NextResponse.json(
      { error: "Invalid OAuth state" },
      { status: 400 }
    );
  }

  // State is single-use, so remove it.
  cookieStore.delete("sk_state");

  try {
    // Ensure required environment variables exist.
   // assertScalekitEnv();

    // Callback URL registered with Scalekit.
    const redirectUri = process.env.SCALEKIT_REDIRECT_URI!;

    // Exchange the authorization code for OAuth tokens.
    const authResult = await scalekit.authenticateWithCode(
      code,
      redirectUri
    );

    // Extract authenticated user information.
    const { user, idToken } = authResult;

    // Validate the ID Token signature and claims.
    const claims = await scalekit.validateToken(idToken);

    // Different providers may use different claim names.
    // Try multiple possibilities.
    const organizationId =
      (claims as any).organization_id ||
      (claims as any).org_id ||
      (claims as any).oid ||
      null;

    // Organization ID is required.
    if (!organizationId) {
      return NextResponse.json(
        { error: "No organization id found in token claims" },
        { status: 500 }
      );
    }

    // ============================================================
    // User Registration
    // ============================================================

    // Check whether the user already exists.
    const existing = await db
      .select()
      .from(User)
      .where(eq(User.email, user.email));

    // Create a new database record for first-time users.
    if (existing.length === 0) {
      await db.insert(User).values({
        name: user?.name || "anonymous",
        email: user.email,
        organization_id: organizationId,
      });
    }

    // ============================================================
    // Redirect User
    // ============================================================

    // Read the page the user originally wanted.
    const nextCookie = cookieStore.get("sk_next")?.value;

    // Remove the temporary cookie.
    cookieStore.delete("sk_next");

    // Prevent open redirect attacks.
    const redirectTarget =
      nextCookie?.startsWith("/") && !nextCookie.startsWith("//")
        ? nextCookie
        : "/dashboard";

    // Create redirect response.
    const response = NextResponse.redirect(
      new URL(redirectTarget, req.url)
    );

    // ============================================================
    // Create User Session
    // ============================================================

    // Session data stored inside a secure HTTP-only cookie.
    const userSession = {
      email: user.email,
      organization_id: organizationId,
      id_token: idToken,
    };

    response.cookies.set("user_session", JSON.stringify(userSession), {
      httpOnly: true, // JavaScript cannot access it
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Error exchanging code:", error);

    return NextResponse.json(
      { error: "Failed to authenticate user" },
      { status: 500 }
    );
  }
}