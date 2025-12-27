import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { HeaderNav } from "@/components/HeaderNav";
import { AppFooter } from "@/components/AppFooter";
import { InitialLoader } from "@/components/InitialLoader";
import Script from "next/script";

const themeScript = `
(() => {
  try {
    const key = "lmga-theme";
    const stored = localStorage.getItem(key);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LMGa Construction Solutions Marketplace",
  description:
    "Browse construction materials and connect builders to LMGa Construction Solutions for turnkey support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-page text-primary antialiased min-h-screen`}
      >
        <Providers>
          <InitialLoader />
          <div className="flex min-h-screen flex-col bg-page">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(39,79,156,0.22),_transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(140,181,255,0.18),_transparent_60%)]" />
            <header className="sticky top-0 z-20 border-b border-[color:var(--border-muted)] bg-[color:var(--surface)]/90 backdrop-blur">
              <HeaderNav />
            </header>
            <main className="flex-1">
              <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:max-w-7xl lg:px-8">
                {children}
              </div>
            </main>
            <AppFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
