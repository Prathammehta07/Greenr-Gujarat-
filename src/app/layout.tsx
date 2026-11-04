import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "GREEN GUJARAT — Mission LiFE Citizen Engagement Platform",
  description: "Small Actions. Big Impact. One Green Gujarat. Measure your carbon footprint, reduce electricity, adopt solar, complete green missions and join the community.",
  keywords: ["GREEN GUJARAT", "Mission LiFE", "GEDA", "sustainability", "carbon footprint", "solar", "Gujarat"],
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
