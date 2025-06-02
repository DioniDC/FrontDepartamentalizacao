"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Plus, Edit } from "lucide-react"

interface Subgrupo {
  codgss00: number
  descgss00: string
  codgrupo00: number
}

interface Grupo {
  codgrupo: number
  descgrupo: string
  coddepto: number
}

export function SubgrupoTab() {
  const [items, setItems] = useState<Subgrupo[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Subgrupo | null>(null)
  const [formData, setFormData] = useState({ codgss00: 0, descgss00: "", codgrupo00: 0 })

  useEffect(() => {
    loadItems()
    loadGrupos()
  }, [])

  const loadItems = async () => {
    try {
      const data = await api.getCadgss()
      setItems(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar subgrupos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadGrupos = async () => {
    try {
      const data = await api.getTabgru()
      setGrupos(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar grupos",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    try {
      await api.createOrUpdateCadgss(formData)
      toast({
        title: "Sucesso",
        description: editingItem ? "Subgrupo atualizado" : "Subgrupo criado",
      })
      setDialogOpen(false)
      setEditingItem(null)
      setFormData({ codgss00: 0, descgss00: "", codgrupo00: 0 })
      loadItems()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar subgrupo",
        variant: "destructive",
      })
    }
  }

  const openDialog = (item?: Subgrupo) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        codgss00: item.codgss00,
        descgss00: item.descgss00,
        codgrupo00: item.codgrupo00,
      })
    } else {
      setEditingItem(null)
      setFormData({ codgss00: 0, descgss00: "", codgrupo00: 0 })
    }
    setDialogOpen(true)
  }

  const getGrupoDescription = (codigo: number) => {
    const grupo = grupos.find((item) => item.codgrupo === codigo)
    return grupo ? grupo.descgrupo : "N/A"
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Subgrupos</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Subgrupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Subgrupo" : "Novo Subgrupo"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="codgss00">Código (0 para criar novo)</Label>
                <Input
                  id="codgss00"
                  type="number"
                  value={formData.codgss00}
                  onChange={(e) => setFormData({ ...formData, codgss00: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="descgss00">Descrição do Subgrupo</Label>
                <Input
                  id="descgss00"
                  value={formData.descgss00}
                  onChange={(e) => setFormData({ ...formData, descgss00: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="grupo">Grupo</Label>
                <Select
                  value={formData.codgrupo00.toString()}
                  onValueChange={(value) => setFormData({ ...formData, codgrupo00: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {grupos.map((item) => (
                      <SelectItem key={item.codgrupo} value={item.codgrupo.toString()}>
                        {item.codgrupo} - {item.descgrupo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.codgss00}>
              <TableCell>{item.codgss00}</TableCell>
              <TableCell>{item.descgss00}</TableCell>
              <TableCell>
                {item.codgrupo00} - {getGrupoDescription(item.codgrupo00)}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => openDialog(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
