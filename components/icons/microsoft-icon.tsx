import { cn } from "@/lib/utils";

// Adapted from https://simpleicons.org/

export function MicrosoftIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6 text-foreground", className)}
      {...props}
    >
      <title>Microsoft</title>
      <path
        fill="currentColor"
        d="M2 3h9v9H2zm9 19H2v-9h9zM21 3v9h-9V3zm0 19h-9v-9h9z"
      />
    </svg>
  );
}
