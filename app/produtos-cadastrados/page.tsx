"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

// Tipagens
interface Produto {
  codpro01: number
  descpro01: string
  codgss01: number
  descgss00: string
  codigos_barras: string
}

interface Subgrupo {
  codgss00: number
  descgss00: string
  codgrupo00: number
}

export default function ProdutosCadastradosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [subgrupos, setSubgrupos] = useState<Subgrupo[]>([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [pendingSearch, setPendingSearch] = useState("")
  const [editandoProduto, setEditandoProduto] = useState<Produto | null>(null)
  const [filtroSubgrupo, setFiltroSubgrupo] = useState("")
  const [loading, setLoading] = useState(false)

  const limit = 15
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://192.168.237.85:8000"

  useEffect(() => {
    setLoading(true)
    const query = new URLSearchParams({
      offset: String(page * limit),
      limit: String(limit),
      ...(search ? { search } : {})
    }).toString()

    fetch(`${apiUrl}/api/produtos/cadastrados?${query}`)
      .then(res => res.json())
      .then(data => {
        setProdutos(data.produtos)
        setTotal(data.total)
        setLoading(false)
      })
  }, [page, search])

  useEffect(() => {
    fetch(`${apiUrl}/api/cadgss`)
      .then(res => res.json())
      .then(data => setSubgrupos(data))
  }, [])

    const handleSalvarSubgrupo = (produto: Produto, novoCodgss: number) => {
    fetch(`${apiUrl}/api/produtos/atualizar_subgrupo_sql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        codpro01: produto.codpro01,
        novo_codgss01: novoCodgss
        })
    })
        .then(res => res.json())
        .then(() => {
        setEditandoProduto(null)
        setProdutos(produtos.map(p =>
            p.codpro01 === produto.codpro01
            ? { ...p, codgss01: novoCodgss, descgss00: subgrupos.find(s => s.codgss00 === novoCodgss)?.descgss00 || "" }
            : p
        ))
        })
        .catch(err => console.error("Erro ao atualizar subgrupo", err))
    }

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-4">
        <CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Produtos Cadastrados no SQL</CardTitle>
          <span className="text-muted-foreground text-sm mt-2 sm:mt-0">
            Total: <b>{total}</b> produtos
          </span>
        </CardHeader>
      </Card>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Buscar por nome ou código"
          value={pendingSearch}
          onChange={(e) => setPendingSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { setSearch(pendingSearch); setPage(0) } }}
          className="border px-2 py-1 text-sm rounded-md w-full max-w-sm dark:bg-gray-900 dark:border-gray-700"
        />
        <Button size="sm" onClick={() => { setSearch(pendingSearch); setPage(0) }} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
          <p className="text-sm mt-2">Carregando...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8 px-2">CÓDIGO</TableHead>
                <TableHead className="h-8 px-2">DESCRIÇÃO</TableHead>
                <TableHead className="h-8 px-2">SUBGRUPO</TableHead>
                <TableHead className="h-8 px-2">DESC. SUBGRUPO</TableHead>
                <TableHead className="h-8 px-2">CÓD. BARRAS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((prod, index) => {
                const barras = prod.codigos_barras.split(" | ")
                return (
                  <TableRow
                    key={prod.codpro01}
                    className={index % 2 === 0 ? "bg-muted/50 hover:bg-muted" : "hover:bg-muted"}
                  >
                    <TableCell className="p-2">{prod.codpro01}</TableCell>
                    <TableCell className="p-2 truncate max-w-[200px]">{prod.descpro01}</TableCell>
                    <TableCell className="p-2 truncate max-w-[150px]">{prod.descgss00}</TableCell>
                    <TableCell className="p-2">
                      <div className="flex items-center gap-1">
                        <span>{prod.codgss01}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => setEditandoProduto(prod)}
                        >
                          <Search className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="flex items-center">
                        <span className="truncate max-w-[120px]">{barras[0]}</span>
                        {barras.length > 1 && (
                          <Button variant="ghost" className="text-xs ml-1 p-1 h-5 w-5" onClick={() => alert(barras.join("\n"))}>
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 px-2">
        <Button
          onClick={() => setPage(page - 1)}
          disabled={page === 0 || loading}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          Página {page + 1} de {Math.ceil(total / limit)}
        </span>
        <Button
          onClick={() => setPage(page + 1)}
          disabled={(page + 1) * limit >= total || loading}
          variant="outline"
          size="sm"
        >
          Próxima <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <Dialog open={!!editandoProduto} onOpenChange={() => setEditandoProduto(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar novo subgrupo</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            placeholder="Buscar subgrupo"
            value={filtroSubgrupo}
            onChange={(e) => setFiltroSubgrupo(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm mb-2"
          />
          <div className="max-h-60 overflow-y-auto border rounded">
            {subgrupos
              .filter(s =>
                s.descgss00.toLowerCase().includes(filtroSubgrupo.toLowerCase()) ||
                String(s.codgss00).includes(filtroSubgrupo)
              )
              .slice(0, 15)
              .map(s => (
                <div
                  key={s.codgss00}
                  onClick={() => editandoProduto && handleSalvarSubgrupo(editandoProduto, s.codgss00)}
                  className="px-2 py-1 hover:bg-muted cursor-pointer text-sm"
                >
                  [{s.codgss00}] {s.descgss00}
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
