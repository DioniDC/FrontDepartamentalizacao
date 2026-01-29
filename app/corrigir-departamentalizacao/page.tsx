"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { ArrowLeft, Search, RefreshCw, AlertTriangle, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Box, Typography } from "@mui/material"
import { ProtectedPage } from "@/components/ProtectedPage"

interface Divergencia {
  codpro01: number
  codpro01_sql: number
  codgss01: number
  codgss01_sql: number
  descpro01: string
  descpro01_sql: string
  codbarra: string
}

interface DivergenciaResponse {
  total: number
  divergencias: Divergencia[]
}

export default function CorrigirDepartamentalizacaoPage() {
  const [divergencias, setDivergencias] = useState<Divergencia[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [correcting, setCorrecting] = useState(false)
  const [recarregando, setRecarregando] = useState(false)
  const [progresso, setProgresso] = useState({ processados: 0, total: 0, percentual: 0 })

  const verificarDivergencias = async () => {
    setLoading(true)
    try {
      const data: DivergenciaResponse = await api.getCorrigirProdutos()
      setDivergencias(data.divergencias)
      setTotal(data.total)

      if (data.total === 0) {
        toast({
          title: "Sucesso",
          description: "Nenhuma divergência encontrada!",
        })
      } else {
        toast({
          title: "Divergências encontradas",
          description: `${data.total} produtos com divergências`,
        })
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao verificar divergências",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const corrigirDivergencias = async () => {
    if (divergencias.length === 0) return;

    setCorrecting(true);

    const chunkSize = 10000;
    const totalItens = divergencias.length;
    let sucesso = 0;
    let falhas = 0;

    setProgresso({ processados: 0, total: totalItens, percentual: 0 });

    for (let i = 0; i < totalItens; i += chunkSize) {
      const loteOriginal = divergencias.slice(i, i + chunkSize);

      const lote = loteOriginal.map(d => ({
        codpro01: d.codpro01,
        descpro01: d.descpro01,
        codgss01: d.codgss01_sql,
      }));

      try {
        await api.atualizarCodgss(lote);
        sucesso += lote.length;
      } catch (err) {
        falhas += lote.length;
        toast({
          title: "Erro",
          description: `Falha ao processar lote ${Math.floor(i / chunkSize) + 1}`,
          variant: "destructive",
        });
      }

      const processados = Math.min(i + chunkSize, totalItens);
      const percentual = Math.round((processados / totalItens) * 100);
      setProgresso({ processados, total: totalItens, percentual });

      await new Promise(resolve => setTimeout(resolve, 0));
    }

    toast({
      title: "Atualização concluída",
      description: `${sucesso} atualizados com sucesso${falhas > 0 ? `, ${falhas} falharam` : ""}`,
    });

    setCorrecting(false);
    setProgresso({ processados: 0, total: 0, percentual: 0 });

    // Limpa a tela e mostra loading enquanto busca divergências restantes
    setDivergencias([]);
    setTotal(0);
    setRecarregando(true);
    await verificarDivergencias();
    setRecarregando(false);
  };

  const columns: GridColDef[] = [
  {
    field: "codbarra",
    headerName: "Código Barras",
    width: 200,
    renderCell: (params) => (
      <Typography title={params.value}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "descpro01_sql",
    headerName: "Descrição SQL",
    width: 400,
    renderCell: (params) => (
      <Typography noWrap title={params.value}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "descpro01",
    headerName: "Descrição DBF",
    width: 400,
    renderCell: (params) => (
      <Typography noWrap title={params.value}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "codgss01_sql",
    headerName: "SUBGRUPO SQL",
    width: 130,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <Typography>{params.value}</Typography>
    ),
  },
  {
    field: "codgss01",
    headerName: "SUBGRUPO DBF",
    width: 130,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <Typography>{params.value}</Typography>
    ),
  },
]

  const rows = divergencias.map((item, index) => ({
    id: `${item.codpro01_sql}-${index}`,
    ...item,
  }))

  return (
    <ProtectedPage>
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Corrigir Departamentalização</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Verificação de Divergências</span>
            <div className="flex gap-2">
              <Button onClick={verificarDivergencias} disabled={loading} variant="outline">
                {loading && <LoadingSpinner size="sm" className="mr-2" />}
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Verificando..." : "Verificar Divergências"}
              </Button>
              {divergencias.length > 0 && (
                <Button onClick={corrigirDivergencias} disabled={correcting}>
                  {correcting && <LoadingSpinner size="sm" className="mr-2" />}
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {correcting ? "Corrigindo..." : "Corrigir Divergências"}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {correcting && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card border rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Atualizando Produtos</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Por favor, aguarde enquanto processamos...
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Progress value={progresso.percentual} className="h-4 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground drop-shadow">
                        {progresso.percentual}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-mono font-medium">
                      {progresso.processados.toLocaleString('pt-BR')}
                      <span className="text-muted-foreground"> de </span>
                      {progresso.total.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Processando lote {Math.ceil(progresso.processados / 10000)} de {Math.ceil(progresso.total / 10000)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {recarregando && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card border rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-300">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Search className="h-8 w-8 animate-pulse text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Verificando...</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    Buscando divergências restantes
                  </p>
                </div>
              </div>
            </div>
          )}

          {total > 0 && !correcting && (
            <div className="mb-4">
              <Badge variant="destructive" className="text-sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {total} divergências encontradas
              </Badge>
            </div>
          )}

          {divergencias.length > 0 ? (
            <Box sx={{ maxHeight: '80vh', width: '100%' }}>
              <DataGrid
                autoHeight
                rows={rows}
                columns={columns}
                pageSizeOptions={[10, 100, 500]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                }}
                disableRowSelectionOnClick
              />
            </Box>

          ) : !loading && total === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma divergência encontrada</p>
            </div>
          ) : (
            !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Clique em "Verificar Divergências" para começar</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
    </ProtectedPage>
  )
}
