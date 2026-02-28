import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { GoogleAuthProvider } from "@/providers/google-auth-provider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});


export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "CircleBet",
  description: "Prediction markets for your circle of friends",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "CircleBet",
    description: "Prediction markets for your circle of friends",
    siteName: "CircleBet",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CircleBet",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CircleBet",
    description: "Prediction markets for your circle of friends",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=JSON.parse(localStorage.getItem("circlebet-theme")||"{}");if((t.state&&t.state.theme)==="light")document.documentElement.classList.add("light")}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <QueryProvider>
          <GoogleAuthProvider>
          {children}
          </GoogleAuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "var(--color-bg-tertiary)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
