import type { Metadata } from "next";
import { Geist_Mono, Manrope, Playfair_Display } from "next/font/google";
import { EcosystemBar } from "@/components/ecosystem/ecosystem-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import "./globals.css";
import "@/styles/axion-science-tokens.css";
import "@/styles/axion-ecosystem-shell.css";
import "@/styles/axion-premium-landing.css";
import "@/styles/axion-premium-workspace.css";

const bodyFont = Manrope({ variable: "--font-body", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const displayFont = Playfair_Display({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Axion Science",
  description: "A project-centered scientific environment connecting computation, reasoning, visualization, and publication.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz">
      <body className={`${bodyFont.variable} ${displayFont.variable} ${geistMono.variable} antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <EcosystemBar currentApp="science" />
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
