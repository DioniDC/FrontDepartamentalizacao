'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from 'next-themes'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { darkTheme, lightTheme } from '@/lib/theme'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props} attribute="class" defaultTheme="dark">
      <InnerThemeProvider>{children}</InnerThemeProvider>
    </NextThemesProvider>
  )
}

function InnerThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, systemTheme } = useTheme() // <- Aqui dentro do componente React!
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <CssBaseline />
  }

  const currentTheme = theme === 'system' ? systemTheme : theme
  const muiTheme = currentTheme === 'dark' ? darkTheme : lightTheme

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
