"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { ArrowLeft, Search, RefreshCw, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Box, Typography } from "@mui/material"

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
    if (divergencias.length === 0) return
    setCorrecting(true)
    try {
      await api.atualizarCodgss(divergencias)
      toast({
        title: "Sucesso",
        description: `${divergencias.length} produtos foram atualizados`,
      })
      await verificarDivergencias()
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao corrigir divergências",
        variant: "destructive",
      })
    } finally {
      setCorrecting(false)
    }
  }

  const columns: GridColDef[] = [
    { field: "codbarra", headerName: "Código Barras", minWidth: 150, flex: 1 },
    {
      field: "descpro01",
      headerName: "Descrição DBF",
      minWidth: 200,
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography noWrap title={params.value}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "descpro01_sql",
      headerName: "Descrição SQL",
      minWidth: 200,
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography noWrap title={params.value}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "codpro01",
      headerName: "Cód. Pro DBF",
      minWidth: 100,
      renderCell: (params) => <Badge variant="outline">{params.value}</Badge>,
    },
    {
      field: "codpro01_sql",
      headerName: "Cód. Pro SQL",
      minWidth: 100,
      renderCell: (params) => <Badge variant="outline">{params.value}</Badge>,
    },
    {
      field: "codgss01",
      headerName: "GSS DBF",
      minWidth: 100,
      renderCell: (params) => <Badge variant="secondary">{params.value}</Badge>,
    },
    {
      field: "codgss01_sql",
      headerName: "GSS SQL",
      minWidth: 100,
      renderCell: (params) => <Badge>{params.value}</Badge>,
    },
  ]

  const rows = divergencias.map((item, index) => ({
    id: `${item.codpro01_sql}-${index}`,
    ...item,
  }))

  return (
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
          {total > 0 && (
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
  )
}
