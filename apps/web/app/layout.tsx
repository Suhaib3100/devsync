import type { Metadata } from "next";
import "./globals.css";
import { GeistMono } from 'geist/font/mono';

export const metadata: Metadata = {
  title: "DevSync - Secure & Encrypted Storage",
  description: "Store and manage your secrets securely with end-to-end encryption. Enter your secret code and unlock your space.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={GeistMono.className}
      >
        {children}
      </body>
    </html>
  );
}
