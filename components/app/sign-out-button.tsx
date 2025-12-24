"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export const SignOutButton = () => {
  const router = useRouter();

  return (
    <Button
      className="cursor-pointer"
      variant="destructive"
      onClick={() => {
        void authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/sign-in");
            },
          },
        });
      }}
    >
      Sign Out
    </Button>
  );
};
