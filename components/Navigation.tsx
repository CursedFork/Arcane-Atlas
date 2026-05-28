"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sword, Users, BookOpen, Shield, Sparkles, Scroll, Package, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/build", label: "Build", icon: Sword },
  { href: "/characters", label: "Characters", icon: Users },
  { href: "/dm", label: "DM Shield", icon: Shield },
  { href: "/homebrew", label: "Homebrew", icon: Sparkles },
  { href: "/spells", label: "Spells", icon: Scroll },
  { href: "/monsters", label: "Bestiary", icon: BookOpen },
  { href: "/items", label: "Items", icon: Package },
  { href: "/rules", label: "Rules", icon: BookOpen },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-bold text-gold-400 hover:text-gold-300 transition-colors"
        >
          <Sword className="h-5 w-5 text-primary" aria-hidden />
          <span className="text-gold-gradient">Arcane Atlas</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          className="md:hidden border-t border-border bg-background px-4 py-3 grid grid-cols-2 gap-2"
          aria-label="Mobile navigation"
        >
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
