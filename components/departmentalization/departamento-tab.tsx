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

interface Departamento {
  coddepto: number
  nomedepto: string
  CODDEPNV4: number
}

interface Nivel4 {
  CODIGO: number
  DESCRICAO: string
}

export function DepartamentoTab() {
  const [items, setItems] = useState<Departamento[]>([])
  const [nivel4Items, setNivel4Items] = useState<Nivel4[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Departamento | null>(null)
  const [formData, setFormData] = useState({ coddepto: 0, nomedepto: "", coddepto_nv4: 0 })

  useEffect(() => {
    loadItems()
    loadNivel4Items()
  }, [])

  const loadItems = async () => {
    try {
      const data = await api.getTabdep()
      setItems(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar departamentos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadNivel4Items = async () => {
    try {
      const data = await api.getDepnv4()
      setNivel4Items(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar níveis 4",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    try {
      await api.createOrUpdateTabdep(formData)
      toast({
        title: "Sucesso",
        description: editingItem ? "Departamento atualizado" : "Departamento criado",
      })
      setDialogOpen(false)
      setEditingItem(null)
      setFormData({ coddepto: 0, nomedepto: "", coddepto_nv4: 0 })
      loadItems()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar departamento",
        variant: "destructive",
      })
    }
  }

  const openDialog = (item?: Departamento) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        coddepto: item.coddepto,
        nomedepto: item.nomedepto,
        coddepto_nv4: item.CODDEPNV4,
      })
    } else {
      setEditingItem(null)
      setFormData({ coddepto: 0, nomedepto: "", coddepto_nv4: 0 })
    }
    setDialogOpen(true)
  }

  const getNivel4Description = (codigo: number) => {
    const nivel4 = nivel4Items.find((item) => item.CODIGO === codigo)
    return nivel4 ? nivel4.DESCRICAO : "N/A"
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Departamentos</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Departamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Departamento" : "Novo Departamento"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="coddepto">Código (0 para criar novo)</Label>
                <Input
                  id="coddepto"
                  type="number"
                  value={formData.coddepto}
                  onChange={(e) => setFormData({ ...formData, coddepto: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="nomedepto">Nome do Departamento</Label>
                <Input
                  id="nomedepto"
                  value={formData.nomedepto}
                  onChange={(e) => setFormData({ ...formData, nomedepto: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="nivel4">Nível 4</Label>
                <Select
                  value={formData.coddepto_nv4.toString()}
                  onValueChange={(value) => setFormData({ ...formData, coddepto_nv4: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um nível 4" />
                  </SelectTrigger>
                  <SelectContent>
                    {nivel4Items.map((item) => (
                      <SelectItem key={item.CODIGO} value={item.CODIGO.toString()}>
                        {item.CODIGO} - {item.DESCRICAO}
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
            <TableHead>Nome</TableHead>
            <TableHead>Nível 4</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.coddepto}>
              <TableCell>{item.coddepto}</TableCell>
              <TableCell>{item.nomedepto}</TableCell>
              <TableCell>
                {item.CODDEPNV4} - {getNivel4Description(item.CODDEPNV4)}
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
