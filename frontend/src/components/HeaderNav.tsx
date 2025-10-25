"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleToggle } from "@/components/LocaleToggle";
import { useLocale } from "@/context/LocaleContext";

const navLinks = [
  { href: "/", labelKey: "nav_home", public: true },
  { href: "/products", labelKey: "nav_products", public: true },
  { href: "/dashboard", labelKey: "nav_dashboard", auth: true },
  { href: "/orders", labelKey: "nav_orders", auth: true },
  { href: "/payments", labelKey: "nav_payments", auth: true },
  {
    href: "/seller",
    labelKey: "nav_seller_tools",
    roles: ["seller_admin", "ops_admin"],
  },
  {
    href: "/products/new",
    labelKey: "nav_add_product",
    roles: ["seller_admin", "seller_staff"],
  },
  { href: "/webhooks", labelKey: "nav_webhooks", auth: true },
];

export function HeaderNav() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthContext();
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleLinks = useMemo(() => {
    return navLinks.filter((link) => {
      if (!isAuthenticated) {
        return Boolean(link.public);
      }
      if (link.roles?.length) {
        return user ? link.roles.includes(user.role) : false;
      }
      if (link.auth) {
        return true;
      }
      return Boolean(link.public);
    });
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const NavLinks = () => (
    <>
      {visibleLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-brand-soft text-primary shadow-soft"
                : "text-muted hover:bg-brand-soft hover:text-primary"
            }`}
          >
            {t(link.labelKey)}
          </Link>
        );
      })}
      {!isAuthenticated ? (
        <>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:bg-brand-soft hover:text-primary"
          >
            {t("nav_login")}
          </Link>
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-strong dark:bg-[color:var(--brand-strong)]"
          >
            {t("nav_register")}
          </Link>
        </>
      ) : (
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-red-300 px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50/30 hover:text-red-600 dark:border-red-400/60 dark:hover:bg-red-500/10"
        >
          {t("nav_logout")}
        </button>
      )}
    </>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      <div className="flex items-center justify-between py-4">
        <Link href="/" className="group flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft font-semibold text-[color:var(--brand)] shadow-soft transition group-hover:scale-105">
              LC
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold text-primary sm:text-lg">
                LMGa Construction Solutions
              </span>
              <span className="text-xs text-muted sm:text-sm">
                {t("nav_tagline")}
              </span>
            </div>
          </Link>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <LocaleToggle />
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border-muted)] text-lg text-primary md:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        <nav className="hidden items-center gap-3 md:flex">
          <NavLinks />
        </nav>
      </div>
      {menuOpen && (
        <nav className="flex flex-col gap-3 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-4 shadow-soft md:hidden">
          <LocaleToggle condensed />
          <NavLinks />
        </nav>
      )}
    </div>
  );
}
