'use client';

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);
<button
  onClick={() =>
    document.documentElement.classList.toggle("dark")
  }
  className="fixed top-4 right-4 px-3 py-1 rounded bg-black text-white"
>
  Toggle Dark Mode
</button>

  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold mb-4">Welcome to Smart Persona Writer</h1>
      <p className="text-lg text-gray-700 mb-6">
        Login to create personas and generate AI-powered content personalized to your voice.
      </p>

      <button
        onClick={() => router.push("/api/auth/signin")}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition"
      >
        Login with Google
      </button>
    </div>
  );
}
