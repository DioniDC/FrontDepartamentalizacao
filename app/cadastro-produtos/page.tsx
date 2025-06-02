"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { ArrowLeft, Search, Save, RefreshCw, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid"
import { Box, Typography } from "@mui/material"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null)
  const [gssSearch, setGssSearch] = useState("")

  useEffect(() => {
    loadProdutos()
    loadGssOptions()
  }, [])

  const loadProdutos = async () => {
    setLoading(true)
    try {
      const data = await api.getProdutosCadastrarIA()
      setProdutos(data)
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: error instanceof Error ? error.message : "Erro ao carregar produtos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadGssOptions = async () => {
    try {
      const data = await api.getCadgss()
      setGssOptions(data)
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: error instanceof Error ? error.message : "Erro ao carregar opções GSS",
        variant: "destructive",
      })
    }
  }

  const updateProduto = (codpro01: number, field: keyof Produto, value: string | number) => {
    setProdutos((prev) =>
      prev.map((p) => (p.codpro01 === codpro01 ? { ...p, [field]: value } : p))
    )
  }

  const selectGss = (gss: GSS) => {
    if (selectedProductIndex !== null) {
      const prod = produtos[selectedProductIndex]
      updateProduto(prod.codpro01, "codgss_sug", gss.codgss00)
      updateProduto(prod.codpro01, "descgss_sug", gss.descgss00)
      setSelectedProductIndex(null)
      setGssSearch("")
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
        description: `Foram cadastrados ${result.total_cadastrados} produtos.`,
      })

      loadProdutos()
    } catch {
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
      gss.descgss00.toLowerCase().includes(gssSearch.toLowerCase()) ||
      gss.codgss00.toString().includes(gssSearch)
  )

  const rows = produtos.map((p) => ({ id: p.codpro01, ...p }))

  const columns: GridColDef[] = [
    { field: "codpro01", headerName: "Código", minWidth: 80, flex: 0.5 },
    {
      field: "descpro01",
      headerName: "Descrição",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Input
          value={params.value}
          onChange={(e) => updateProduto(params.row.codpro01, "descpro01", e.target.value)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      field: "codgss_sug",
      headerName: "Cód. GSS",
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Input
          type="number"
          value={params.value}
          onChange={(e) =>
            updateProduto(params.row.codpro01, "codgss_sug", Number.parseInt(e.target.value) || 0)
          }
          style={{ width: 100 }}
        />
      ),
    },
    { field: "descgss_sug", headerName: "Descrição GSS", flex: 1, minWidth: 180 },
    {
      field: "acoes",
      headerName: "Ações",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const index = produtos.findIndex((p) => p.codpro01 === params.row.codpro01)
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProductIndex(index)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Escolher Subgrupo</DialogTitle>
              </DialogHeader>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Input
                  placeholder="Pesquisar subgrupo..."
                  value={gssSearch}
                  onChange={(e) => setGssSearch(e.target.value)}
                  autoFocus
                />
                <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
                  <DataGrid
                    rows={filteredGss.map((gss) => ({
                      id: gss.codgss00,
                      codgss00: gss.codgss00,
                      descgss00: gss.descgss00,
                      codgrupo00: gss.codgrupo00,
                    }))}
                    columns={[
                      { field: "codgss00", headerName: "Código", width: 100 },
                      { field: "descgss00", headerName: "Descrição", flex: 1 },
                      {
                        field: "selecionar",
                        headerName: "Ação",
                        width: 120,
                        sortable: false,
                        filterable: false,
                        renderCell: (params) => (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => selectGss(params.row as unknown as GSS)}
                          >
                            Selecionar
                          </Button>
                        ),
                      },
                    ]}
                    pageSizeOptions={[5, 10]}
                    paginationModel={{ pageSize: 5, page: 0 }}
                    disableRowSelectionOnClick
                    autoHeight
                  />
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Cadastro de Produtos</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Produtos para Cadastro ({produtos.length})</span>
            <Button
              onClick={processarTodos}
              disabled={processing || produtos.length === 0}
              variant="default"
              size="sm"
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {processing ? "Processando..." : "Processar Todos"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">
              Carregando produtos...
            </div>
          ) : produtos.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
              <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum produto para cadastro</p>
            </div>
          ) : (
            <Box sx={{ maxHeight: "70vh", width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } },
                }}
                disableRowSelectionOnClick
                autoHeight
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
