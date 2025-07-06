// components/Navbar.js
"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center mb-6">
      <Link href="/" className="text-xl font-bold text-purple-700">
        Smart Persona Writer
      </Link>
      <div>
        {session ? (
          <>
            <Link href="/dashboard" className="mr-4">
              Dashboard
            </Link>
            <button onClick={() => signOut()} className="bg-purple-600 text-white px-4 py-2 rounded">
              Logout
            </button>
          </>
        ) : (
          <button onClick={() => signIn("google")} className="bg-purple-600 text-white px-4 py-2 rounded">
            Login with Google
          </button>
        )}
      </div>
    </nav>
  );
}
