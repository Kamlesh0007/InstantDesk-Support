"use server";

import { cookies } from "next/headers";

export const isAuthorized = async () => {
  // Get the cookie store for the current request.
  const cookieStore = await cookies();

  // Read the "user_session" cookie.
  // This cookie was created after a successful login.
  const userSession = cookieStore.get("user_session");

  // Default to null (user is not authenticated).
  let user = null;

  // If the session cookie exists...
  if (userSession) {
    try {
      // The cookie value is stored as a JSON string.
      // Convert it back into a JavaScript object.
      user = JSON.parse(userSession.value);

      // Example result:
      // {
      //   email: "kamlesh@gmail.com",
      //   organization_id: "org_123",
      //   id_token: "eyJhbGciOi..."
      // }
    } catch (e) {
      // Handle invalid or corrupted cookie data.
      console.error("Failed to parse user session", e);
    }
  }

  // Return the authenticated user object,
  // or null if the user is not logged in.
  return user;
};