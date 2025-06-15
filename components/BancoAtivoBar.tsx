// components/BancoAtivoBar.tsx

"use client"

import { useDatabase } from "@/app/providers/DatabaseProvider"

export function BancoAtivoBar() {
  const { bancoAtivo } = useDatabase()

  if (!bancoAtivo) return null

  return (
    <div className="w-full bg-green-600 text-white text-sm p-2 text-center shadow font-semibold">
      Banco de Dados Ativo: <strong>{bancoAtivo.toUpperCase()}</strong>
    </div>
  )
}
