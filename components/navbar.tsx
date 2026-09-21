"use client";

import { Button } from "@heroui/react";
import clsx from "clsx";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { ThemeSwitch } from "@/components/theme-switch";
import { siteConfig } from "@/config/site";

export function Navbar({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const links = email ? siteConfig.navItems : [];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/70 backdrop-blur-lg">
      <header className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6">
          <NextLink
            className="flex items-center gap-2"
            href={email ? "/pokemon" : "/login"}
          >
            <span aria-hidden className="text-xl">
              ⬤
            </span>
            <span className="font-bold">{siteConfig.name}</span>
          </NextLink>

          <ul className="hidden md:flex gap-5">
            {links.map((item) => (
              <li key={item.href}>
                <NextLink
                  className={clsx(
                    "transition-colors hover:text-accent",
                    pathname.startsWith(item.href)
                      ? "text-accent font-medium"
                      : "text-foreground",
                  )}
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitch />

          {email ? (
            <>
              <span className="hidden lg:inline text-sm text-muted">
                {email}
              </span>
              <Button size="sm" variant="tertiary" onPress={logout}>
                Salir
              </Button>
              <button
                aria-expanded={isMenuOpen}
                aria-label="Abrir menú"
                className="md:hidden p-2"
                onClick={() => setMenuOpen(!isMenuOpen)}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d={
                      isMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </>
          ) : null}
        </div>
      </header>

      {isMenuOpen && email ? (
        <ul className="flex flex-col gap-1 border-t border-separator px-6 py-3 md:hidden">
          {links.map((item) => (
            <li key={item.href}>
              <NextLink
                className="block py-2"
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NextLink>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
}
