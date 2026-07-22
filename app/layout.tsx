import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEO Audit Tool",
  description: "Technical SEO audit automation for Advant Labs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface-page text-ink min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
