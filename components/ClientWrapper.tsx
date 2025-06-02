"use client"

import { useEffect, useState } from "react"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { Toaster } from "@/components/ui/toaster"

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <main className="min-h-screen bg-background" />
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <main className="min-h-screen bg-background">{children}</main>
      <Toaster />
    </ThemeProvider>
  )
}