import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
import {
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";

const resolvedBaseUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL;

export const authClient = createAuthClient({
  baseURL: resolvedBaseUrl,
  plugins: [
    passkeyClient(),
    organizationClient(),
    inferAdditionalFields({
      user: {
        firstName: { type: "string", required: true },
        lastName: { type: "string", required: true },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
