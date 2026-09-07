import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://county-ledger.vercel.app"),
  title: {
    default: "CountyLedger — Free Tax-Delinquent & Foreclosure Property Directory",
    template: "%s | CountyLedger",
  },
  description:
    "A free, public directory of tax-delinquent, tax-lien, and tax-sale properties across US states and counties, sourced entirely from official government open-data portals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col text-brand-950 antialiased">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
