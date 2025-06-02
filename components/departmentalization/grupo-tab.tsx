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

interface Grupo {
  codgrupo: number
  descgrupo: string
  coddepto: number
}

interface Departamento {
  coddepto: number
  nomedepto: string
  CODDEPNV4: number
}

export function GrupoTab() {
  const [items, setItems] = useState<Grupo[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Grupo | null>(null)
  const [formData, setFormData] = useState({ codgrupo: 0, descgrupo: "", coddepto: 0 })

  useEffect(() => {
    loadItems()
    loadDepartamentos()
  }, [])

  const loadItems = async () => {
    try {
      const data = await api.getTabgru()
      setItems(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar grupos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDepartamentos = async () => {
    try {
      const data = await api.getTabdep()
      setDepartamentos(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar departamentos",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    try {
      await api.createOrUpdateTabgru(formData)
      toast({
        title: "Sucesso",
        description: editingItem ? "Grupo atualizado" : "Grupo criado",
      })
      setDialogOpen(false)
      setEditingItem(null)
      setFormData({ codgrupo: 0, descgrupo: "", coddepto: 0 })
      loadItems()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar grupo",
        variant: "destructive",
      })
    }
  }

  const openDialog = (item?: Grupo) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        codgrupo: item.codgrupo,
        descgrupo: item.descgrupo,
        coddepto: item.coddepto,
      })
    } else {
      setEditingItem(null)
      setFormData({ codgrupo: 0, descgrupo: "", coddepto: 0 })
    }
    setDialogOpen(true)
  }

  const getDepartamentoName = (codigo: number) => {
    const depto = departamentos.find((item) => item.coddepto === codigo)
    return depto ? depto.nomedepto : "N/A"
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Grupos</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Grupo" : "Novo Grupo"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="codgrupo">Código (0 para criar novo)</Label>
                <Input
                  id="codgrupo"
                  type="number"
                  value={formData.codgrupo}
                  onChange={(e) => setFormData({ ...formData, codgrupo: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="descgrupo">Descrição do Grupo</Label>
                <Input
                  id="descgrupo"
                  value={formData.descgrupo}
                  onChange={(e) => setFormData({ ...formData, descgrupo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="departamento">Departamento</Label>
                <Select
                  value={formData.coddepto.toString()}
                  onValueChange={(value) => setFormData({ ...formData, coddepto: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((item) => (
                      <SelectItem key={item.coddepto} value={item.coddepto.toString()}>
                        {item.coddepto} - {item.nomedepto}
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
            <TableHead>Departamento</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.codgrupo}>
              <TableCell>{item.codgrupo}</TableCell>
              <TableCell>{item.descgrupo}</TableCell>
              <TableCell>
                {item.coddepto} - {getDepartamentoName(item.coddepto)}
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
