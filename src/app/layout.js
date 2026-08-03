import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/components/ToastProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "My Services — Digital Services Marketplace",
    template: "%s | My Services",
  },
  description:
    "Find and order premium digital services including software development, graphic design, academic formatting, and consulting.",
  keywords: ["digital services", "freelance marketplace", "web development", "design", "consulting"],
  openGraph: {
    title: "My Services — Digital Services Marketplace",
    description: "Connect with verified professionals for your digital projects.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "My Services",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body className="flex flex-col min-h-screen bg-base-100 text-base-content antialiased">
        <AuthProvider>
          <ToastProvider />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
