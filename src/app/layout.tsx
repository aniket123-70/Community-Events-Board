import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { Header, HeaderFallback } from "@/components/Header";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "Community Events Board",
  description: "Music nights, workshops, food fairs and more happening near you.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <AuthProvider>
          <Suspense fallback={<HeaderFallback />}>
            <Header />
          </Suspense>
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
          <Toaster position="bottom-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
