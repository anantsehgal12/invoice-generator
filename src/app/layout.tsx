import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from '@/contexts/AppContext'
import { ToastProvider } from '@/contexts/ToastContext'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Invoice Generator - Professional Billing App",
  description: "Create and manage professional invoices with GST calculations, company management, and product catalog",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-[#0a2540] text-white`}>
        <ToastProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
