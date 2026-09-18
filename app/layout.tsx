import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Route — your application, mapped out",
  description:
    "Turn a school record, budget, and country list into a university application route with explanations — not a match percentage.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
