import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";

import { Providers } from "./providers";

import { Navbar } from "@/components/navbar";
import { fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { currentUser } from "@/lib/current-user";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await currentUser();

  return (
    <html suppressHydrationWarning lang="es">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background text-foreground font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers
          themeProps={{
            attribute: ["class", "data-theme"],
            defaultTheme: "dark",
          }}
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar email={session?.email} />
            <main className="container mx-auto max-w-7xl flex-grow px-6 py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
