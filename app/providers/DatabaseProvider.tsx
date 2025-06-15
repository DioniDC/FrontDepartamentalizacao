"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface DatabaseContextType {
  bancoAtivo: string | null
  setBancoAtivo: (banco: string) => void
}

const DatabaseContext = createContext<DatabaseContextType>({
  bancoAtivo: null,
  setBancoAtivo: () => {}
})

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [bancoAtivo, setBancoAtivo] = useState<string | null>(null)

  useEffect(() => {
    const fetchBanco = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/api/database/active`)
        const data = await res.json()
        setBancoAtivo(data.banco_ativo || null)
      } catch {
        setBancoAtivo(null)
      }
    }
    fetchBanco()
  }, [])

  return (
    <DatabaseContext.Provider value={{ bancoAtivo, setBancoAtivo }}>
      {children}
    </DatabaseContext.Provider>
  )
}

export const useDatabase = () => useContext(DatabaseContext)
