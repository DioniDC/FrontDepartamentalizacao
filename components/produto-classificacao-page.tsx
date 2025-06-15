"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Search, Save, AlertTriangle, Pencil } from "lucide-react"
import Link from "next/link"
import { DataGrid, GridColDef, GridRenderCellParams, GridPaginationModel } from "@mui/x-data-grid"
import { Box } from "@mui/material"
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

interface ProdutoClassificacaoPageProps {
  titulo: string
  getProdutos: () => Promise<Produto[]>
  processarProdutos: (produtos: any[]) => Promise<any>
  edicaoDescricaoHabilitada?: boolean
}

export default function ProdutoClassificacaoPage({ titulo, getProdutos, processarProdutos, edicaoDescricaoHabilitada }: ProdutoClassificacaoPageProps) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [gssOptions, setGssOptions] = useState<GSS[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null)
  const [gssSearch, setGssSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [totalCadastrados, setTotalCadastrados] = useState(0)
  const [totalRestante, setTotalRestante] = useState(0)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [gssPage, setGssPage] = useState(0)
  const pageSize = 20
  const initializedRef = useRef(false)
  const [confirmarVoltarOpen, setConfirmarVoltarOpen] = useState(false);

  useEffect(() => {
    if (!initializedRef.current) {
      loadProdutos()
      loadGssOptions()
      initializedRef.current = true
    }
  }, [])

  const loadProdutos = async () => {
    setLoading(true)
    try {
      const data = await getProdutos()
      setProdutos(data)
      setTotalRestante(data.length)
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

  const normalizarTexto = (texto: string) => {
  return texto
    .toUpperCase()
    .replace(/[^A-ZÀ-Ü0-9 ]/gi, "") // mantém letras com acento, números e espaço
  }

  const handleVoltar = () => {
    if (loading) {
      setConfirmarVoltarOpen(true)
    } else {
      window.location.href = "/"
    }
  } 

  const loadGssOptions = async () => {
    try {
      const data = await (await import("@/lib/api")).api.getCadgss()
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

  const removerProduto = (codpro01: number) => {
    setProdutos(prev => prev.filter(p => p.codpro01 !== codpro01))
    setTotalRestante(prev => prev - 1)
  }

  const selectGss = (gss: GSS) => {
    if (selectedProductIndex !== null) {
      const prod = produtos[selectedProductIndex]
      updateProduto(prod.codpro01, "codgss_sug", gss.codgss00)
      updateProduto(prod.codpro01, "descgss_sug", gss.descgss00)
      setSelectedProductIndex(null)
      setGssSearch("")
      setGssPage(0)
      setIsDialogOpen(false)
    }
  }

  const processarTodos = async () => {
    setProcessing(true)
    try {
      const produtosParaProcessar = produtos.map((p) => ({
        codpro01: p.codpro01,
        codpro01_sql: p.codpro01,
        codgss01: p.codgss_sug,
        codgss01_sql: p.codgss_sug,
        descpro01: p.descpro01,
        descpro01_sql: p.descpro01,
        codbarra: ""
      }))

      const result = await processarProdutos(produtosParaProcessar)

      toast({
        title: "Sucesso",
        description: `Foram processados ${result.total_cadastrados} produtos.`,
      })

      loadProdutos()
      setTotalCadastrados(0)
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

  const processarVisiveis = async () => {
    setProcessing(true)
    try {
      const start = paginationModel.page * paginationModel.pageSize
      const end = start + paginationModel.pageSize
      const produtosVisiveis = produtos.slice(start, end)

      const produtosParaProcessar = produtosVisiveis.map((p) => ({
        codpro01: p.codpro01,
        codgss01: p.codgss_sug,
        descpro01: p.descpro01,
      }))

      const result = await processarProdutos(produtosParaProcessar)

      toast({
        title: "Sucesso",
        description: `Foram processados ${result.total_cadastrados} produtos.`,
      })

      const idsProcessados = new Set(produtosVisiveis.map(p => p.codpro01))
      const novosProdutos = produtos.filter(p => !idsProcessados.has(p.codpro01))
      setProdutos(novosProdutos)
      setTotalCadastrados(prev => prev + result.total_cadastrados)
      setTotalRestante(novosProdutos.length)

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

  const filteredGss = useMemo(() => {
    const search = gssSearch.toLowerCase()
    return gssOptions.filter(
      (gss) =>
        gss.descgss00.toLowerCase().includes(search) ||
        gss.codgss00.toString().includes(search)
    )
  }, [gssSearch, gssOptions])

  const paginatedGss = useMemo(() => {
    const start = gssPage * pageSize
    return filteredGss.slice(start, start + pageSize)
  }, [filteredGss, gssPage])

  const rows = produtos.map((p) => ({ id: p.codpro01, ...p }))

  const columns: GridColDef[] = [
    {
      field: "remover",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          size="sm"
          variant="ghost"
          className="text-red-500"
          onClick={() => removerProduto(params.row.codpro01)}
        >
          ✕
        </Button>
      ),
    },
    { field: "codpro01", headerName: "Código", minWidth: 80, flex: 0.5 },
    {
      field: "descpro01",
      headerName: "Descrição",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const [isEditing, setIsEditing] = useState(false)
        const [localValue, setLocalValue] = useState(params.value)
      
        const handleSave = () => {
          updateProduto(params.row.codpro01, "descpro01", localValue)
          setIsEditing(false)
        }
      
        return isEditing ? (
        <Input
          value={localValue}
          onChange={(e) => setLocalValue(normalizarTexto(e.target.value))}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSave();
            } else {
              e.stopPropagation();  // <- ESSA LINHA LIBERA O SPACE
            }
          }}
          autoFocus
          style={{ width: "100%" }}
        />
        ) : (
          <div className="flex justify-between w-full items-center">
            <span>{params.value}</span>
            {edicaoDescricaoHabilitada && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil size={16} />
              </Button>
            )}
          </div>
        )
      }

    },
    {
      field: "codgss_sug",
      headerName: "Cód. GSS",
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <span>{params.value}</span>
      ),
    },
    { field: "descgss_sug", headerName: "Descrição GSS (Sugestão IA)", flex: 1, minWidth: 180 },
    {
      field: "acoes",
      headerName: "Ações",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const index = produtos.findIndex((p) => p.codpro01 === params.row.codpro01)
        return (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => { setSelectedProductIndex(index); setIsDialogOpen(true) }}>
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
                  onChange={(e) => { setGssSearch(e.target.value); setGssPage(0) }}
                  autoFocus
                />

                <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
                  <table className="w-full text-sm border">
                    <thead>
                      <tr>
                        <th className="p-2 border">Código</th>
                        <th className="p-2 border">Descrição</th>
                        <th className="p-2 border">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedGss.map((gss) => (
                        <tr key={gss.codgss00}>
                          <td className="p-2 border">{gss.codgss00}</td>
                          <td className="p-2 border">{gss.descgss00}</td>
                          <td className="p-2 border">
                            <Button size="sm" variant="outline" onClick={() => selectGss(gss)}>
                              Selecionar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>

                <div className="flex justify-between items-center mt-2">
                  <Button variant="outline" size="sm" disabled={gssPage === 0} onClick={() => setGssPage(gssPage - 1)}>
                    Anterior
                  </Button>
                  <span>Página {gssPage + 1} de {Math.ceil(filteredGss.length / pageSize)}</span>
                  <Button variant="outline" size="sm" disabled={(gssPage + 1) * pageSize >= filteredGss.length} onClick={() => setGssPage(gssPage + 1)}>
                    Próxima
                  </Button>
                </div>
              </Box>
            </DialogContent>
          </Dialog>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="flex items-center" onClick={handleVoltar}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </ Button>
          <h1 className="text-2xl font-bold">{titulo}</h1>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setConfirmDialogOpen(true)}>
          Processar Todos
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span>Produtos ({totalRestante}) — Processados: {totalCadastrados}</span>
            <Button
              onClick={processarVisiveis}
              disabled={processing || produtos.length === 0}
              variant="default"
              size="sm"
              className="flex items-center bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {processing ? "Processando tela..." : "Processar Tela"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Carregando produtos...</div>
          ) : produtos.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
              <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum produto encontrado</p>
            </div>
          ) : (
            <Box sx={{ maxHeight: "70vh", width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[10, 25, 50]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                disableRowSelectionOnClick
                autoHeight
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Processamento</DialogTitle>
          </DialogHeader>
          <p className="mb-4">Deseja realmente processar todos os {totalRestante} produtos restantes?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { setConfirmDialogOpen(false); processarTodos(); }}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmarVoltarOpen} onOpenChange={setConfirmarVoltarOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Carregamento em andamento</DialogTitle>
        </DialogHeader>
        <p className="mb-4">
          Ainda estamos carregando os produtos com auxílio de IA, este processo consome tokens pagos. Tem certeza que deseja cancelar agora e sair?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmarVoltarOpen(false)}>Continuar carregando</Button>
          <Button variant="destructive" onClick={() => window.location.href = "/"}>Sair mesmo assim</Button>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  )
}
