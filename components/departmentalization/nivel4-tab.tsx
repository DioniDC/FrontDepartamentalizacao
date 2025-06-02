"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Plus, Edit } from "lucide-react"

interface Nivel4 {
  CODIGO: number
  DESCRICAO: string
}

export function Nivel4Tab() {
  const [items, setItems] = useState<Nivel4[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Nivel4 | null>(null)
  const [formData, setFormData] = useState({ codigo: 0, descricao: "" })

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const data = await api.getDepnv4()
      setItems(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar níveis 4",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await api.createOrUpdateDepnv4(formData)
      toast({
        title: "Sucesso",
        description: editingItem ? "Nível 4 atualizado" : "Nível 4 criado",
      })
      setDialogOpen(false)
      setEditingItem(null)
      setFormData({ codigo: 0, descricao: "" })
      loadItems()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar nível 4",
        variant: "destructive",
      })
    }
  }

  const openDialog = (item?: Nivel4) => {
    if (item) {
      setEditingItem(item)
      setFormData({ codigo: item.CODIGO, descricao: item.DESCRICAO })
    } else {
      setEditingItem(null)
      setFormData({ codigo: 0, descricao: "" })
    }
    setDialogOpen(true)
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Nível 4</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Nível 4
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Nível 4" : "Novo Nível 4"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="codigo">Código (0 para criar novo)</Label>
                <Input
                  id="codigo"
                  type="number"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
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
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.CODIGO}>
              <TableCell>{item.CODIGO}</TableCell>
              <TableCell>{item.DESCRICAO}</TableCell>
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
