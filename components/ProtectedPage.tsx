"use client"

import { useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const [bancoAtivo, setBancoAtivo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://192.168.237.85:8000"
    fetch(`${apiUrl}/api/database/active`)
      .then(res => res.json())
      .then(data => {
        setBancoAtivo(data.banco_ativo) 
        setLoading(false)
      })
      .catch(() => {
        toast({ title: "Erro ao verificar banco ativo", variant: "destructive" })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>
  }

  if (!bancoAtivo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg font-semibold">Selecione um banco de dados primeiro</span>
      </div>
    )
  }

  return <>{children}</>
}
