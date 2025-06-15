"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Plus, Edit } from "lucide-react"
import { Box, Typography } from "@mui/material"
import { DataGrid, GridColDef } from "@mui/x-data-grid"

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
  const [search, setSearch] = useState("")

  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      loadItems()
      loadDepartamentos()
      initialized.current = true
    }
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

  const filteredItems = items.filter((item) => {
    const searchLower = search.toLowerCase()
    return (
      item.codgrupo.toString().includes(searchLower) ||
      item.descgrupo.toLowerCase().includes(searchLower)
    )
  })

  const columns: GridColDef[] = [
    { field: "codgrupo", headerName: "Código", width: 100, headerAlign: 'center', align: 'center' },
    { 
      field: "descgrupo", 
      headerName: "Descrição", 
      flex: 1,
      renderCell: (params) => (
        <Typography noWrap title={params.value}>{params.value}</Typography>
      )
    },
    { 
      field: "departamento", 
      headerName: "Departamento", 
      flex: 1,
      renderCell: (params: any) => {
        const desc = getDepartamentoName(params.row.coddepto)
        return `${params.row.coddepto} - ${desc}`
      }
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button variant="outline" size="sm" onClick={() => openDialog(params.row)}>
          <Edit className="h-4 w-4" />
        </Button>
      )
    }
  ]

  const rows = filteredItems.map((item) => ({ id: item.codgrupo, ...item }))

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Grupos</h3>
        <Input
          type="text"
          placeholder="Buscar por código ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80"
        />
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
              {editingItem && (
                <div>
                  <Label htmlFor="codgrupo">Código</Label>
                  <Input
                    id="codgrupo"
                    type="number"
                    value={formData.codgrupo}
                    onChange={(e) => setFormData({ ...formData, codgrupo: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}
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
              <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Box sx={{ maxHeight: '80vh', width: '100%' }}>
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } }
          }}
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  )
}
