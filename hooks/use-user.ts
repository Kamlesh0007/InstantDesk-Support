"use client";

import { isAuthorized } from "@/lib/isAuthorized";
import { useEffect, useState } from "react";

export const useUser = () => {
  // Stores the logged-in user's email.
  const [email, setEmail] = useState<string | null>(null);

  // Indicates whether we're still loading the user.
  const [loading, setLoading] = useState(true);

  // Runs once when the component using this hook mounts.
  useEffect(() => {
    const fetchUser = async () => {
      // Get the authenticated user.
      // ⚠️ This is currently calling a server function from a client component,
      // which is not the recommended approach in Next.js.
      const user = await isAuthorized();

      // Save the user's email in state.
      setEmail(user?.email ?? null);

      // User loading is complete.
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Expose the email and loading state to components.
  return { email, loading };
};