"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Search, Save, AlertTriangle, Pencil, Play, Loader2, CheckCircle2, Clock, Database, Copy, RefreshCw } from "lucide-react"
import { DataGrid, GridColDef, GridRenderCellParams, GridPaginationModel } from "@mui/x-data-grid"
import { Box } from "@mui/material"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Produto, ProdutosIAResponse  } from "@/app/produtos-cadastrados/type"
import { Badge } from "@/components/ui/badge"

interface GSS {
  codgss00: number
  descgss00: string
  codgrupo00: number
}

interface ProdutoClassificacaoPageProps {
  titulo: string
  getProdutos: () => Promise<ProdutosIAResponse>
  processarProdutos: (produtos: any[]) => Promise<any>
  edicaoDescricaoHabilitada?: boolean
}

export default function ProdutoClassificacaoPage({
  titulo,
  getProdutos,
  processarProdutos,
  edicaoDescricaoHabilitada,
}: ProdutoClassificacaoPageProps) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [gssOptions, setGssOptions] = useState<GSS[]>([])
  const [loading, setLoading] = useState(false)
  const [buscaIniciada, setBuscaIniciada] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null)
  const [gssSearch, setGssSearch] = useState("")
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [totalCadastrados, setTotalCadastrados] = useState(0)
  const [totalRestante, setTotalRestante] = useState(0)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [gssPage, setGssPage] = useState(0)
  const [confirmarVoltarOpen, setConfirmarVoltarOpen] = useState(false)
  const [ultimoGssSelecionado, setUltimoGssSelecionado] = useState<GSS | null>(null)
  const [dialogOpenProductId, setDialogOpenProductId] = useState<number | null>(null)
  const [totalMaximo, setTotalMaximo] = useState(0)

  const pageSize = 20
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!initializedRef.current) {
      loadGssOptions()
      initializedRef.current = true
    }
  }, [])

  useEffect(() => {
    console.log("ultimoGssSelecionado mudou:", ultimoGssSelecionado)
  }, [ultimoGssSelecionado])

  const loadProdutos = async () => {
    setLoading(true)
    try {
      const response = await getProdutos()
      if (Array.isArray(response)) {
        setProdutos(response)
        setTotalRestante(response.length)
      } else {
        setProdutos(response.produtos || [])
        setTotalRestante(response.total_processado || 0)
        setTotalMaximo(response.total_disponivel || response.total_processado || 0)
      }
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

  const iniciarBusca = () => {
    setBuscaIniciada(true)
    loadProdutos()
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

  const normalizarTexto = (texto: string) => {
    return texto.toUpperCase().replace(/[^A-ZÀ-Ü0-9 ]/gi, "")
  }

  const handleVoltar = () => {
    if (loading) {
      setConfirmarVoltarOpen(true)
    } else {
      window.location.href = "/"
    }
  }

  const updateProduto = (codpro01: number, field: keyof Produto, value: string | number) => {
    setProdutos((prev) => prev.map((p) => (p.codpro01 === codpro01 ? { ...p, [field]: value } : p)))
  }

  const removerProduto = (codpro01: number) => {
    setProdutos((prev) => prev.filter((p) => p.codpro01 !== codpro01))
    setTotalRestante((prev) => prev - 1)
  }

  const selectGss = (gss: GSS) => {
    if (selectedProductIndex !== null) {
      const prod = produtos[selectedProductIndex]
      updateProduto(prod.codpro01, "codgss_sug", gss.codgss00)
      updateProduto(prod.codpro01, "descgss_sug", gss.descgss00)
      setUltimoGssSelecionado({ ...gss })
      setSelectedProductIndex(null)
      setGssSearch("")
      setGssPage(0)
      setDialogOpenProductId(null)
      
      toast({
        title: "Subgrupo selecionado",
        description: `Subgrupo ${gss.codgss00} - ${gss.descgss00} foi armazenado como último selecionado`,
      })
    }
  }

  const processarTodos = async () => {
    setProcessing(true)
    try {
      const produtosParaProcessar = produtos.map((p) => ({
      codpro01: p.codpro01,
      descpro01: p.descpro01,
      codgss01: p.codgss_sug,
      }))

      const result = await processarProdutos(produtosParaProcessar)

      toast({
        title: "Sucesso",
        description: `Foram processados ${result.total_cadastrados} produtos.`,
        duration: 2000,
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
        duration: 2000,
      })

      const idsProcessados = new Set(produtosVisiveis.map((p) => p.codpro01))
      const novosProdutos = produtos.filter((p) => !idsProcessados.has(p.codpro01))
      setProdutos(novosProdutos)
      setTotalCadastrados((prev) => prev + result.total_cadastrados)
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
        gss.descgss00.toLowerCase().includes(search) || gss.codgss00.toString().includes(search)
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
      width: 36,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-red-500"
          onClick={() => removerProduto(params.row.codpro01)}
        >
          ✕
        </Button>
      ),
    },
    { field: "codpro01", headerName: "Cód", width: 70 },
    {
      field: "descpro01",
      headerName: "Descrição",
      flex: 1,
      minWidth: 150,
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
              if (e.key === "Enter") handleSave()
              else e.stopPropagation()
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
      },
    },
    {
      field: "codgss_sug",
      headerName: "GSS",
      width: 60,
      renderCell: (params: GridRenderCellParams) => <span>{params.value}</span>,
    },
    {
      field: "descgss_sug",
      headerName: "Subgrupo (IA)",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const index = produtos.findIndex((p) => p.codpro01 === params.row.codpro01)
        const codpro = params.row.codpro01

        return (
          <div className="flex gap-1 items-center">
            <Dialog
              open={dialogOpenProductId === codpro}
              onOpenChange={(open) => setDialogOpenProductId(open ? codpro : null)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    setSelectedProductIndex(index)
                    setDialogOpenProductId(codpro)
                  }}
                >
                  <Search className="h-3 w-3" />
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
                    onChange={(e) => {
                      setGssSearch(e.target.value)
                      setGssPage(0)
                    }}
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
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={gssPage === 0}
                      onClick={() => setGssPage(gssPage - 1)}
                    >
                      Anterior
                    </Button>
                    <span>
                      Página {gssPage + 1} de {Math.ceil(filteredGss.length / pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(gssPage + 1) * pageSize >= filteredGss.length}
                      onClick={() => setGssPage(gssPage + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                </Box>
              </DialogContent>
            </Dialog>

            {ultimoGssSelecionado && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => {
                  updateProduto(codpro, "codgss_sug", ultimoGssSelecionado.codgss00)
                  updateProduto(codpro, "descgss_sug", ultimoGssSelecionado.descgss00)
                  toast({
                    title: "Aplicado",
                    description: `GSS ${ultimoGssSelecionado.codgss00}`,
                  })
                }}
                title={`Aplicar: ${ultimoGssSelecionado.codgss00} - ${ultimoGssSelecionado.descgss00}`}
              >
                <Copy className="h-3 w-3 mr-1" />
                Repetir
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const progressPercent = totalMaximo > 0 ? Math.round((totalCadastrados / totalMaximo) * 100) : 0

  return (
    <div className="w-full px-2 py-2 space-y-2 text-sm">
      {/* Header + Stats em linha única */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-2 py-1.5 rounded border border-border bg-card">
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleVoltar}>
          <ArrowLeft className="h-3 w-3 mr-1" />
          Voltar
        </Button>
        <span className="font-semibold">{titulo}</span>

        <div className="hidden sm:flex items-center gap-1 text-xs">
          <Database className="h-3 w-3 text-blue-500" />
          <span className="text-muted-foreground">Total:</span>
          <span className="font-bold text-blue-500">{totalMaximo}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3 text-amber-500" />
          <span className="text-muted-foreground">Pend:</span>
          <span className="font-bold text-amber-500">{totalRestante}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span className="text-muted-foreground">Feitos:</span>
          <span className="font-bold text-green-500">{totalCadastrados}</span>
        </div>
        <div className="hidden md:flex items-center gap-1 flex-1 max-w-[120px] text-xs">
          <span className="text-muted-foreground">{progressPercent}%</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Último Subgrupo */}
        {ultimoGssSelecionado && (
          <div className="flex items-center gap-1.5 ml-auto border-l border-border pl-2 text-xs">
            <Badge variant="outline" className="h-5 px-1 text-xs">{ultimoGssSelecionado.codgss00}</Badge>
            <span className="hidden lg:inline max-w-[150px] truncate">{ultimoGssSelecionado.descgss00}</span>
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs"
              onClick={() => {
                const start = paginationModel.page * paginationModel.pageSize
                const end = start + paginationModel.pageSize
                const produtosVisiveis = produtos.slice(start, end)

                const novosProdutos = produtosVisiveis.map((p) => ({
                  ...p,
                  codgss_sug: ultimoGssSelecionado.codgss00,
                  descgss_sug: ultimoGssSelecionado.descgss00,
                }))

                setProdutos((prev) =>
                  prev.map((p) => {
                    const atualizado = novosProdutos.find((np) => np.codpro01 === p.codpro01)
                    return atualizado ?? p
                  })
                )

                toast({
                  title: "Subgrupo aplicado",
                  description: `Subgrupo ${ultimoGssSelecionado.codgss00} aplicado a ${produtosVisiveis.length} itens`,
                })
              }}
            >
              Aplicar Tela
            </Button>
          </div>
        )}
      </div>

      {/* Área Principal */}
      <Card className="flex-1">
        <CardContent className="p-2">
          {!buscaIniciada ? (
            <div className="text-center py-8 flex flex-col items-center gap-4">
              <Search className="h-10 w-10 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Clique para buscar os produtos (classificação via IA)</p>
              <Button
                onClick={iniciarBusca}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Busca
              </Button>
            </div>
          ) : loading ? (
            <div className="text-center py-8 flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-muted-foreground">Carregando... (IA processando)</p>
            </div>
          ) : produtos.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground flex flex-col items-center gap-2">
              <AlertTriangle className="h-8 w-8 opacity-50" />
              <p>Nenhum produto encontrado</p>
              <Button onClick={iniciarBusca} variant="outline" size="sm">
                <RefreshCw className="h-3 w-3 mr-1" />
                Buscar Novamente
              </Button>
            </div>
          ) : (
            <>
              <Box sx={{ width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSizeOptions={[10, 25, 50, 100]}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  disableRowSelectionOnClick
                  autoHeight
                  density="compact"
                  sx={{
                    border: 'none',
                    fontSize: '0.8rem',
                    '& .MuiDataGrid-cell': {
                      py: 0.5,
                    },
                    '& .MuiDataGrid-cell:focus': {
                      outline: 'none',
                    },
                  }}
                />
              </Box>

              {/* Barra de Ações */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs">
                <span className="text-muted-foreground">
                  {Math.min(paginationModel.pageSize, produtos.length)} de {produtos.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={processarVisiveis}
                    disabled={processing || produtos.length === 0}
                    size="sm"
                    className="h-7 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    {processing ? "..." : "Processar Tela"}
                  </Button>
                  <Button
                    onClick={() => setConfirmDialogOpen(true)}
                    disabled={processing || produtos.length === 0}
                    variant="destructive"
                    size="sm"
                    className="h-7"
                  >
                    Todos ({totalRestante})
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Processamento</DialogTitle>
          </DialogHeader>
          <p className="mb-4">
            Deseja realmente processar todos os {totalRestante} produtos restantes?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmDialogOpen(false)
                processarTodos()
              }}
            >
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
            Ainda estamos carregando os produtos com auxílio de IA, este processo consome tokens
            pagos. Tem certeza que deseja cancelar agora e sair?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmarVoltarOpen(false)}>
              Continuar carregando
            </Button>
            <Button variant="destructive" onClick={() => (window.location.href = "/")}>
              Sair mesmo assim
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}