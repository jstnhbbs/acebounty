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
        className="card-dark w-full max-w-sm rounded-xl border-2 border-transparent p-6 shadow-sm transition-all duration-300"
      >
        <h1 className="card-dark-title mb-4 text-xl font-semibold">
          Admin login
        </h1>
        {error && <p className="mb-3 form-error">{error}</p>}
        <label className="form-label">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 form-input"
        />
        <label className="form-label">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-4 form-input"
        />
        <button type="submit" disabled={loading} className="w-full btn-primary">
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
