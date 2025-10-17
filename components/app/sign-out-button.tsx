"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export const SignOutButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        void authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/sign-in");
            },
          },
        });
      }}
      className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
    >
      Sign Out
    </button>
  );
};
