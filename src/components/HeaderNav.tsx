"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { HeaderAuth } from "./HeaderAuth";
import { ThemeToggle } from "./ThemeToggle";

const navLink =
  "rounded-lg px-4 py-2 text-[#e0e0e0] font-medium transition-all duration-300 hover:bg-[rgba(183,153,83,0.2)] hover:text-[#B79953]";
const navLinkActive = "bg-[rgba(183,153,83,0.25)] text-[#B79953] font-semibold";

export function HeaderNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="container mx-auto flex max-w-[1200px] items-center justify-between px-8">
      <Link
        href="/"
        className="text-xl font-bold text-[#e0e0e0] transition-all duration-300 hover:scale-105 hover:text-[#B79953]"
      >
        Ace Bounty
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className={pathname === "/" ? `${navLink} ${navLinkActive}` : navLink}
        >
          Home
        </Link>
        <Link
          href="/history"
          className={
            pathname === "/history" ? `${navLink} ${navLinkActive}` : navLink
          }
        >
          History
        </Link>
        {session?.user ? (
          <HeaderAuth navLink={navLink} navLinkActive={navLinkActive} pathname={pathname} />
        ) : (
          <Link
            href="/admin"
            className={
              pathname.startsWith("/admin")
                ? `${navLink} ${navLinkActive}`
                : navLink
            }
          >
            Admin
          </Link>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
}
