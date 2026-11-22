import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InstantDesk Support - Human Friendly AI",
  description:
    "Turn your website into an AI support desk in minutes. InstantDesk reads your docs and answers customer questions instantly — accurate, on-brand, no scripts to write.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-[#050509] min-h-screen flex flex-col p-0 antialiased text-zinc-100 selection:bg-zinc-800 font-sans`}
      >
        {children}
      </body>
    </html>
  );
}