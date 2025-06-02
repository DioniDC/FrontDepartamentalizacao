"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { ArrowLeft, Search, Save, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"

// Import the loading spinner
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Produto {
  codpro01: number
  descpro01: string
  codgss_sug: number
  descgss_sug: string
}

interface GSS {
  codgss00: number
  descgss00: string
  codgrupo00: number
}

export default function CadastroProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [gssOptions, setGssOptions] = useState<GSS[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null)
  const [gssSearch, setGssSearch] = useState("")

  useEffect(() => {
    loadProdutos()
    loadGssOptions()
  }, [])

  // Adicionar um componente de erro mais informativo no início da função

  const loadProdutos = async () => {
    try {
      console.log("🔄 Carregando produtos...")
      const data = await api.getProdutosCadastrarIA()
      console.log("✅ Produtos carregados:", data)
      setProdutos(data)
    } catch (error) {
      console.error("❌ Erro ao carregar produtos:", error)
      toast({
        title: "Erro de Conexão",
        description: error instanceof Error ? error.message : "Erro ao carregar produtos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadGssOptions = async () => {
    try {
      console.log("🔄 Carregando opções GSS...")
      const data = await api.getCadgss()
      console.log("✅ GSS carregado:", data)
      setGssOptions(data)
    } catch (error) {
      console.error("❌ Erro ao carregar GSS:", error)
      toast({
        title: "Erro de Conexão",
        description: error instanceof Error ? error.message : "Erro ao carregar opções GSS",
        variant: "destructive",
      })
    }
  }

  const updateProduto = (index: number, field: keyof Produto, value: string | number) => {
    const updatedProdutos = [...produtos]
    updatedProdutos[index] = { ...updatedProdutos[index], [field]: value }
    setProdutos(updatedProdutos)
  }

  const selectGss = (gss: GSS) => {
    if (selectedProductIndex !== null) {
      updateProduto(selectedProductIndex, "codgss_sug", gss.codgss00)
      updateProduto(selectedProductIndex, "descgss_sug", gss.descgss00)
      setSelectedProductIndex(null)
    }
  }

  const processarTodos = async () => {
    setProcessing(true)
    try {
      const produtosParaCadastro = produtos.map((p) => ({
        codpro01: p.codpro01,
        descpro01: p.descpro01,
        codgss01: p.codgss_sug,
      }))

      const result = await api.cadastrarProdutos(produtosParaCadastro)

      toast({
        title: "Sucesso",
        description: `Foram cadastrados ${result.total_cadastrados} produtos, verifique!`,
      })

      // Recarregar a lista
      loadProdutos()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar produtos",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const filteredGss = gssOptions.filter(
    (gss) =>
      gss.descgss00.toLowerCase().includes(gssSearch.toLowerCase()) || gss.codgss00.toString().includes(gssSearch),
  )

  // Adicionar uma seção de debug/erro quando não há produtos e houve erro

  // Update the loading state display
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Cadastro de Produtos</h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando produtos...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Conectando com: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Adicionar uma seção para quando não há produtos (pode ser erro de conexão)
  if (!loading && produtos.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Cadastro de Produtos</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nenhum produto encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar produtos ou não há produtos para cadastrar.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Verifique se:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>O servidor da API está rodando</li>
                  <li>A URL da API está configurada corretamente</li>
                  <li>Há produtos no DBF que não estão no MySQL</li>
                </ul>
              </div>
              <Button
                onClick={() => {
                  setLoading(true)
                  loadProdutos()
                }}
                className="mt-4"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Cadastro de Produtos</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Produtos para Cadastro ({produtos.length})</CardTitle>
            <Button
              onClick={processarTodos}
              disabled={processing || produtos.length === 0}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {processing ? "Processando..." : "Processar Todos"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cód. GSS</TableHead>
                  <TableHead>Desc. GSS</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto, index) => (
                  <TableRow key={produto.codpro01}>
                    <TableCell>{produto.codpro01}</TableCell>
                    <TableCell>
                      <Input
                        value={produto.descpro01}
                        onChange={(e) => updateProduto(index, "descpro01", e.target.value)}
                        className="min-w-[200px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={produto.codgss_sug}
                        onChange={(e) => updateProduto(index, "codgss_sug", Number.parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>{produto.descgss_sug}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedProductIndex(index)}>
                            <Search className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Escolher Subgrupo</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Pesquisar subgrupo..."
                              value={gssSearch}
                              onChange={(e) => setGssSearch(e.target.value)}
                            />
                            <div className="max-h-96 overflow-y-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Ação</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filteredGss.map((gss) => (
                                    <TableRow key={gss.codgss00}>
                                      <TableCell>{gss.codgss00}</TableCell>
                                      <TableCell>{gss.descgss00}</TableCell>
                                      <TableCell>
                                        <Button size="sm" onClick={() => selectGss(gss)}>
                                          Selecionar
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
