"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-8 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border-2 border-transparent bg-white p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300 dark:bg-[#2d2d44] dark:shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
      >
        <h1 className="mb-4 text-xl font-semibold text-[#333] transition-colors duration-300 dark:text-[#e0e0e0]">
          Admin login
        </h1>
        {error && (
          <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </p>
        )}
        <label className="mb-2 block text-sm font-medium text-[#333] transition-colors dark:text-[#e0e0e0]">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 w-full rounded border border-[#999] bg-white px-3 py-2 text-[#333] focus:border-[#B79953] focus:outline-none focus:ring-1 focus:ring-[#B79953] dark:border-white/20 dark:bg-[#1a1a2e] dark:text-[#e0e0e0] dark:focus:border-[#B79953] dark:focus:ring-[#B79953]"
        />
        <label className="mb-2 block text-sm font-medium text-[#333] transition-colors dark:text-[#e0e0e0]">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-4 w-full rounded border border-[#999] bg-white px-3 py-2 text-[#333] focus:border-[#B79953] focus:outline-none focus:ring-1 focus:ring-[#B79953] dark:border-white/20 dark:bg-[#1a1a2e] dark:text-[#e0e0e0] dark:focus:border-[#B79953] dark:focus:ring-[#B79953]"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-[#B79953] py-2 font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-[calc(100vh-80px)] items-center justify-center">Loading…</main>}>
      <LoginForm />
    </Suspense>
  );
}
