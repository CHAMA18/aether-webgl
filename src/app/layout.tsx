import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AETHER — Interactive 3D WebGL Experience",
  description:
    "An immersive WebGL journey: a living, morphing light entity orbited by twenty-two thousand glowing particles. Drag, zoom, click to pulse, and travel between four themed dimensions.",
  keywords: ["WebGL", "Three.js", "3D", "interactive experience", "particles", "shaders", "creative coding"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "AETHER — Interactive 3D WebGL Experience",
    description:
      "A living, morphing light entity orbited by twenty-two thousand glowing particles.",
    siteName: "AETHER",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AETHER — Interactive 3D WebGL Experience",
    description:
      "A living, morphing light entity orbited by twenty-two thousand glowing particles.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
