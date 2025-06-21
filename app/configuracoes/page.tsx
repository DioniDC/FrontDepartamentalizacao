"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload, Database, HardDrive, Trash, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useDatabase } from "../providers/DatabaseProvider"

export default function ConfiguracoesPage() {
  const [bancos, setBancos] = useState<string[]>([])
  const [dbfs, setDbfs] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { bancoAtivo, setBancoAtivo } = useDatabase()

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://192.168.237.85:8000"

  const loadDados = async () => {
    try {
      const bancosResp = await fetch(`${apiUrl}/api/databases`)
      const bancosJson = await bancosResp.json()
      setBancos(bancosJson)

      const dbfResp = await fetch(`${apiUrl}/api/dbf/files`)
      const dbfJson = await dbfResp.json()
      setDbfs(dbfJson)
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao carregar dados", variant: "destructive" })
    }
  }

  useEffect(() => { loadDados() }, [])

  const handleUpload = async () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append("file", selectedFile)

    const res = await fetch(`${apiUrl}/api/dbf/upload`, { method: "POST", body: formData })
    if (res.ok) {
      toast({ title: "Arquivo enviado com sucesso" })
      setSelectedFile(null)
      loadDados()
    } else {
      const err = await res.json()
      toast({ title: "Erro", description: err.detail, variant: "destructive" })
    }
  }

  const handleDelete = async (nome: string) => {
    if (!confirm(`Remover o arquivo ${nome}?`)) return

    try {
      const res = await fetch(`${apiUrl}/api/dbf/remove/${nome}`, { method: "DELETE" })

      if (res.ok) {
        toast({ title: "Arquivo removido" })
        loadDados()
      } else {
        const err = await res.json()
        toast({
          title: "Erro",
          description: err.detail || "Falha ao remover",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão ou inesperado",
        variant: "destructive",
      })
    }
  }

  const handleSelecionarBanco = async (nome: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/database/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_banco: nome }),
      })
  
if (res.ok) {
  setBancoAtivo(nome)
  toast({ title: `Banco ${nome} selecionado` })
} else {
  const err = await res.json()

  let description = "Falha ao selecionar banco"
  if (err?.detail) {
    if (Array.isArray(err.detail)) {
      description = err.detail.map((d: any) => d.msg).join(", ")
    } else {
      description = err.detail
    }
  }

  toast({
    title: "Erro",
    description,
    variant: "destructive",
  })
}
    } catch {
      toast({ title: "Erro de conexão", variant: "destructive" })
    }
  }

  return (
      <div className="max-w-2xl mx-auto py-4 space-y-4">

        <Card>
          <CardHeader><CardTitle>Bancos de Dados</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {bancos.map(db => (
                <li key={db} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Database className="h-4 w-4" /> {db}
                  </span>
                  {bancoAtivo === db ? (
                    <Button variant={bancoAtivo === db ? "default" : "outline"} 
                      className={bancoAtivo === db ? "bg-green-500 text-white hover:bg-green-600" : ""}>
                      Usar
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleSelecionarBanco(db)}>Usar</Button>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Arquivos DBF</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1 mb-3">
              {dbfs.map(file => (
                <li key={file} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><HardDrive className="h-4 w-4" /> {file}</span>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(file)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <Input type="file" accept=".dbf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              <Button onClick={handleUpload} disabled={!selectedFile}>
                <Upload className="h-4 w-4 mr-1" />Enviar
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
  )
}
