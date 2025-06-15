"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { RefreshCw, Save, Plus, Trash2, Database, Server } from "lucide-react"

// Utilitário para buscar a URL atual
const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function ConfiguracoesPage() {
  const [apiUrl, setApiUrl] = useState("")
  const [newApiUrl, setNewApiUrl] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const [bancos, setBancos] = useState<string[]>([])
  const [dbfs, setDbfs] = useState<string[]>([])
  const [novoDbf, setNovoDbf] = useState("")
  const [selectedDatabase, setSelectedDatabase] = useState("")

  useEffect(() => {
    const url = getApiUrl()
    setApiUrl(url)
    setNewApiUrl(url)

    carregarBancos()
    carregarDbfs()
  }, [])

  const carregarBancos = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/databases`)
      const data = await res.json()
      setBancos(data)
    } catch (err) {
      toast({ title: "Erro ao carregar bancos", variant: "destructive" })
    }
  }

  const carregarDbfs = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/dbf/files`)
      const data = await res.json()
      setDbfs(data)
    } catch (err) {
      toast({ title: "Erro ao carregar DBFs", variant: "destructive" })
    }
  }

  const handleSaveApi = () => {
    setApiUrl(newApiUrl)
    setIsEditing(false)
    toast({ title: "URL da API atualizada", description: "A página será recarregada" })
    setTimeout(() => window.location.reload(), 1500)
  }

  const adicionarDbf = async () => {
    if (!novoDbf) return
    try {
      const res = await fetch(`${getApiUrl()}/api/dbf/add?nome=${novoDbf}`, { method: "POST" })
      if (res.ok) {
        toast({ title: "Arquivo DBF adicionado" })
        setNovoDbf("")
        carregarDbfs()
      } else {
        const err = await res.json()
        toast({ title: "Erro", description: err.detail, variant: "destructive" })
      }
    } catch {
      toast({ title: "Erro de conexão", variant: "destructive" })
    }
  }

  const removerDbf = async (nome: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/dbf/remove/${nome}`, { method: "DELETE" })
      if (res.ok) {
        toast({ title: "Arquivo DBF removido" })
        carregarDbfs()
      }
    } catch {
      toast({ title: "Erro de conexão", variant: "destructive" })
    }
  }

  const selecionarDatabase = (db: string) => {
    setSelectedDatabase(db)
    toast({
      title: "Banco selecionado",
      description: `Agora operando com ${db}. (Aqui no front é só simulação)`
    })
    // Aqui no seu projeto real você pode salvar em sessionStorage ou enviar para o backend
  }

  return (
    <div className="container mx-auto p-6 space-y-6">

      {/* API URL */}
      <Card>
        <CardHeader>
          <CardTitle>URL da API</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="flex gap-2">
              <Input value={newApiUrl} onChange={(e) => setNewApiUrl(e.target.value)} />
              <Button onClick={handleSaveApi}><Save className="w-4 h-4 mr-2" />Salvar</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm">{apiUrl}</span>
              <Button variant="outline" onClick={() => setIsEditing(true)}>Editar</Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Para alterar permanente, edite o NEXT_PUBLIC_API_URL no Vercel.
          </p>
        </CardContent>
      </Card>

      {/* Controle de Banco */}
      <Card>
        <CardHeader>
          <CardTitle><Database className="inline w-5 h-5 mr-2" />Selecionar Banco</CardTitle>
          <CardDescription>Lista de bancos disponíveis no MySQL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {bancos.map(db => (
            <div key={db} className="flex justify-between">
              <span>{db}</span>
              <Button size="sm" variant={selectedDatabase === db ? "default" : "outline"}
                onClick={() => selecionarDatabase(db)}>
                {selectedDatabase === db ? "Selecionado" : "Selecionar"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Controle de DBFs */}
      <Card>
        <CardHeader>
          <CardTitle><Server className="inline w-5 h-5 mr-2" />Arquivos DBF</CardTitle>
          <CardDescription>Gerencie arquivos DBF existentes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Listagem de DBFs */}
          <div className="space-y-2">
            {dbfs.map(file => (
              <div key={file} className="flex justify-between">
                <span>{file}</span>
                <Button variant="outline" size="sm" onClick={() => removerDbf(file)}>
                  <Trash2 className="w-4 h-4 mr-1" /> Remover
                </Button>
              </div>
            ))}
          </div>

          {/* Adicionar novo DBF */}
          <div className="flex gap-2 mt-4">
            <Input placeholder="Nome do novo DBF (sem .dbf)" value={novoDbf} onChange={e => setNovoDbf(e.target.value)} />
            <Button onClick={adicionarDbf}><Plus className="w-4 h-4 mr-1" />Adicionar</Button>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
