import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  // This field may be ommitted if the auth server is running on the same domain as your client
  // Consider ommitting so that better-auth uses relative URLs which will help prevent misconfig
  // between environments (dev, staging, prod, etc).
  // baseURL: "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>()],
});

// export const { signIn, signOut, signUp, useSession } = authClient
