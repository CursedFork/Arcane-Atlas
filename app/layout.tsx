import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Providers } from "@/components/Providers";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Arcane Atlas — D&D 5e Companion",
    template: "%s | Arcane Atlas",
  },
  description:
    "A free D&D 5e (2014) character builder and Dungeon Master companion. Build characters, manage homebrew, run encounters.",
  keywords: ["D&D", "5e", "DnD", "character builder", "dungeon master", "tabletop RPG"],
  robots: "index, follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable} dark`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
              <p>
                Arcane Atlas &mdash; built with the{" "}
                <a
                  href="/credits"
                  className="underline hover:text-primary transition-colors"
                >
                  D&D 5e SRD (OGL 1.0a)
                </a>
              </p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
