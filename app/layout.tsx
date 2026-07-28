import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RenderCraft - Code to MP4",
  description: "Advanced Video Rendering Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
