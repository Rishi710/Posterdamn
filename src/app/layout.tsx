import type { Metadata } from "next";
import { Poppins, Albert_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Banner from "@/components/layout/Banner";

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const albertSans = Albert_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Posterdamn | Premium Wall Art",
  description: "High-quality posters for your space.",
};

import { Providers } from "./providers";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${albertSans.variable} font-sans antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
