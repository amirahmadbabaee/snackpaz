import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Providers";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "دختر اسنک‌پز | بازی اسنک‌پز",
  description:
    "بازی موبایلی مدیریت زمان و آشپزی با محوریت برند اسنک‌پز (مهسا، دختر اسنک‌پز). بپز، امتیاز جمع کن، دل ببخش!",
  keywords: ["اسنک پز", "دختر اسنک پز", "ذرت مکزیکی", "بازی", "snackpaz"],
  authors: [{ name: "امیراحمد بابائی", url: "https://github.com/amirahmadbabee" }],
  icons: {
    icon: "/brand-logo.jpg",
  },
  openGraph: {
    title: "دختر اسنک‌پز | بازی اسنک‌پز",
    description: "با مهسا بپز، امتیاز جمع کن، دل ببخش!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} font-sans antialiased bg-background text-foreground`}
        style={{ fontFamily: "var(--font-vazirmatn), system-ui, sans-serif" }}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
