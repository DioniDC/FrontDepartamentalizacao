"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload, Database, HardDrive, Trash, Download, Package, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { useDatabase } from "../providers/DatabaseProvider"

export default function ConfiguracoesPage() {
  const [bancos, setBancos] = useState<string[]>([])
  const [dbfs, setDbfs] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showGerarBaseDialog, setShowGerarBaseDialog] = useState(false)
  const [isGerandoBase, setIsGerandoBase] = useState(false)
  const { bancoAtivo, setBancoAtivo } = useDatabase()

  const apiUrl = ""

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

  const handleBackupSQL = () => {
    if (!bancoAtivo) {
      toast({ title: "Selecione um banco de dados antes de fazer o backup", variant: "destructive" })
      return
    }
    window.open(`${apiUrl}/api/database/backup`, "_blank")
  }

  const handleDownloadDBFs = () => {
    if (dbfs.length === 0) {
      toast({ title: "Nenhum arquivo DBF disponível para download", variant: "destructive" })
      return
    }
    window.open(`${apiUrl}/api/dbf/download`, "_blank")
  }

  const handleGerarBaseDepartamentalizacao = async () => {
    if (!bancoAtivo) {
      toast({ title: "Selecione um banco de dados antes de gerar a base", variant: "destructive" })
      return
    }

    setIsGerandoBase(true)
    try {
      window.open(`${apiUrl}/api/gerar-base-departamentalizacao`, "_blank")
      toast({ title: "Download da base iniciado com sucesso!" })
    } catch (error) {
      toast({ title: "Erro ao gerar base", description: "Ocorreu um erro ao gerar a base de departamentalização", variant: "destructive" })
    } finally {
      setIsGerandoBase(false)
      setShowGerarBaseDialog(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-3 px-2">
      {/* Grid principal - 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Coluna Esquerda - Bancos de Dados */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              Bancos de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 px-4 pb-3">
            <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {bancos.map(db => (
                <li key={db} className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50">
                  <span className="text-sm truncate flex-1">{db}</span>
                  {bancoAtivo === db ? (
                    <Button size="sm" variant="default" className="bg-green-500 text-white hover:bg-green-600 h-7 text-xs">
                      Ativo
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleSelecionarBanco(db)}>
                      Usar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Coluna Direita - Arquivos DBF */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Arquivos DBF
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 px-4 pb-3">
            <ul className="space-y-1 max-h-32 overflow-y-auto pr-1 mb-2">
              {dbfs.map(file => (
                <li key={file} className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50">
                  <span className="text-sm truncate flex-1">{file}</span>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(file)}>
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 pt-2 border-t">
              <Input type="file" accept=".dbf" className="h-8 text-xs" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              <Button size="sm" className="h-8" onClick={handleUpload} disabled={!selectedFile}>
                <Upload className="h-3.5 w-3.5 mr-1" />Enviar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backup SQL */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" />
              Backup SQL
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-xs text-muted-foreground mb-2">Gera backup do banco selecionado</p>
            <Button size="sm" className="w-full" onClick={handleBackupSQL}>
              <Download className="h-3.5 w-3.5 mr-2" />
              Backup {bancoAtivo || "Nenhum banco"}
            </Button>
          </CardContent>
        </Card>

        {/* Backup DBFs */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" />
              Backup DBFs
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-xs text-muted-foreground mb-2">Baixa todos os arquivos DBF zipados</p>
            <Button size="sm" className="w-full" onClick={handleDownloadDBFs}>
              <Download className="h-3.5 w-3.5 mr-2" />
              Baixar DBFs ZIP
            </Button>
          </CardContent>
        </Card>

        {/* Gerar Base - ocupa as 2 colunas */}
        <Card className="lg:col-span-2">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Gerar Base com Departamentalização
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Exporta as tabelas de departamentalização do banco SQL para arquivos DBF
              </p>
              <Button size="sm" onClick={() => setShowGerarBaseDialog(true)} disabled={!bancoAtivo || isGerandoBase}>
                {isGerandoBase ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Package className="h-3.5 w-3.5 mr-2" />
                    Gerar Base
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Confirmação */}
      <AlertDialog open={showGerarBaseDialog} onOpenChange={setShowGerarBaseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gerar Base com Departamentalização</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Será gerado um arquivo <code className="bg-muted px-1 rounded">.zip</code> contendo:</p>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Da pasta DBF (existentes):</p>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                    <li><code className="bg-muted px-1 rounded">cadpro.dbf</code> - Cadastro de produtos</li>
                    <li><code className="bg-muted px-1 rounded">arqbar.dbf</code> - Códigos de barras</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Gerados do SQL:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                    <li><code className="bg-muted px-1 rounded">tabgru.dbf</code> - Grupos</li>
                    <li><code className="bg-muted px-1 rounded">cadgss.dbf</code> - Subgrupos</li>
                    <li><code className="bg-muted px-1 rounded">tabdep.dbf</code> - Departamentos</li>
                    <li><code className="bg-muted px-1 rounded">depnv4.dbf</code> - Nível 4</li>
                    <li><code className="bg-muted px-1 rounded">depnv5.dbf</code> - Nível 5</li>
                  </ul>
                </div>

                <p className="text-sm font-medium">Banco selecionado: <span className="text-primary">{bancoAtivo}</span></p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleGerarBaseDepartamentalizacao} disabled={isGerandoBase}>
              {isGerandoBase ? "Gerando..." : "Gerar e Baixar ZIP"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
