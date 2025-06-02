"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { ArrowLeft, Search, RefreshCw, AlertTriangle } from "lucide-react"
import Link from "next/link"

// Import the loading spinner
import { LoadingSpinner } from "@/components/ui/loading-spinner"

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
    } catch (error) {
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

      // Verificar novamente após correção
      await verificarDivergencias()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao corrigir divergências",
        variant: "destructive",
      })
    } finally {
      setCorrecting(false)
    }
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
        <h1 className="text-2xl font-bold">Corrigir Departamentalização</h1>
      </div>

      <div className="space-y-6">
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código Barras</TableHead>
                      <TableHead>Descrição DBF</TableHead>
                      <TableHead>Descrição SQL</TableHead>
                      <TableHead>Cód. Pro DBF</TableHead>
                      <TableHead>Cód. Pro SQL</TableHead>
                      <TableHead>GSS DBF</TableHead>
                      <TableHead>GSS SQL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {divergencias.map((div, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{div.codbarra}</TableCell>
                        <TableCell className="max-w-xs truncate" title={div.descpro01}>
                          {div.descpro01.trim()}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={div.descpro01_sql}>
                          {div.descpro01_sql}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{div.codpro01}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{div.codpro01_sql}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{div.codgss01}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{div.codgss01_sql}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : total === 0 && !loading ? (
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

            {total > 0 && divergencias.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">
                    Produtos com possíveis divergências de códigos de barras e conflito nos SUBGRUPOS verifique no banco
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
