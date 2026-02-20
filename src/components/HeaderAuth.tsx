"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function HeaderAuth({
  navLink,
  navLinkActive,
  pathname,
}: {
  navLink?: string;
  navLinkActive?: string;
  pathname?: string;
}) {
  const linkClass =
    navLink && navLinkActive && pathname?.startsWith("/admin")
      ? `${navLink} ${navLinkActive}`
      : navLink ?? "text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";
  const btnClass =
    navLink ?? "text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

  return (
    <>
      <Link href="/admin" className={linkClass}>
        Admin
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className={btnClass}
      >
        Sign out
      </button>
    </>
  );
}
