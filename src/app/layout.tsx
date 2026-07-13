import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AUTOWEB COMMERCE - Voitures d'occasion premium | Bondues, Lille",
  description:
    "Voitures d'occasion selectionnees, garanties et preparees. Bondues, Lille.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-18041617288"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18041617288');
            `,
          }}
        />
      </head>
      <body className="bg-anthracite text-bone font-sans antialiased">
        <Navbar />
        <main className="pt-20 md:pt-[72px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
