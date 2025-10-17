import { SignOutButton } from "@/components/app/sign-out-button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Locksmith!</h1>
          <p className="mt-2 text-gray-600">
            A modern Next.js starter with authentication
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Hello!</h2>
          <p className="text-gray-600 mb-4">You are signed in.</p>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
