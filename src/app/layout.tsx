import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  FileText,
  Settings,
} from "lucide-react";
import { CustomersProvider } from "../context/CustomersContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NOVA ΑΠΟΛΥΜΑΝΤΙΚΗ - Πίνακας Ελέγχου",
  description: "Σύστημα Διαχείρισης NOVA ΑΠΟΛΥΜΑΝΤΙΚΗ",
};

const navItems = [
  { href: "/", label: "Πίνακας Ελέγχου", icon: LayoutDashboard },
  { href: "/customers", label: "Πελάτες", icon: Users },
  { href: "/services", label: "Υπηρεσίες", icon: Wrench },
  { href: "/products", label: "Προϊόντα", icon: Package },
  { href: "/offers", label: "Προσφορές", icon: FileText },
  { href: "/ρυθμισεις", label: "Ρυθμίσεις", icon: Settings },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen bg-slate-50 text-slate-900`}
      >
        <CustomersProvider>
        <aside className="w-64 flex-shrink-0 bg-slate-900 text-white">
          <div className="flex h-full flex-col p-4">
            <div className="mb-8 border-b border-slate-700 pb-4">
              <h1 className="text-xl font-bold text-white">
                NOVA ΑΠΟΛΥΜΑΝΤΙΚΗ
              </h1>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex-1 overflow-auto p-6">{children}</main>
        </CustomersProvider>
      </body>
    </html>
  );
}
