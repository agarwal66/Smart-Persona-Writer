'use client';

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const scrollToLogin = () => {
    document.getElementById("login-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* 🌗 Toggle Theme Button */}
      <button
        onClick={() => document.documentElement.classList.toggle("dark")}
        className="fixed top-4 right-4 px-3 py-1 rounded bg-black text-white dark:bg-white dark:text-black transition"
      >
        Toggle Dark Mode
      </button>

      <main className="text-center pt-28 px-4">
        {/* 🎯 Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Smart Persona Writer
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Generate AI-powered content tailored to your personality.
          </p>
          <button
            onClick={scrollToLogin}
            className="btn-primary text-lg px-6 py-3 rounded-full transition"
          >
            Try Now
          </button>
        </motion.div>

        {/* 🚀 Features Section */}
        <motion.div
          className="mt-24 grid gap-8 md:grid-cols-3 text-left max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
          }}
        >
          {[
            "🎯 Create persona-based profiles for unique voices",
            "📝 Generate custom blog posts, bios, or intros",
            "⚡ Save time by automating high-quality content",
          ].map((text, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
              <p className="text-lg font-medium text-gray-800 dark:text-gray-100">{text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 🔐 Login Section */}
        <div id="login-section" className="mt-24">
          <h2 className="text-3xl font-bold mb-4">Get Started</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Login to build personas and start creating content instantly.
          </p>
          <button
            onClick={() => router.push("/api/auth/signin")}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition"
          >
            Login with Google
          </button>
        </div>
      </main>
    </>
  );
}