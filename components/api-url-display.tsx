"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { RefreshCw, Save } from "lucide-react"

export function ApiUrlDisplay() {
  const [apiUrl, setApiUrl] = useState("")
  const [newApiUrl, setNewApiUrl] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    setApiUrl(url)
    setNewApiUrl(url)
  }, [])

  const handleSave = () => {
    // Não podemos realmente mudar a variável de ambiente no cliente,
    // mas podemos simular isso para fins de demonstração
    setApiUrl(newApiUrl)
    setIsEditing(false)

    // Mostrar um toast informativo
    toast({
      title: "URL da API atualizada",
      description: "A página será recarregada para aplicar as mudanças.",
    })

    // Recarregar a página após um breve delay
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  const testConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}/docs`, {
        method: "HEAD",
      })

      if (response.ok) {
        toast({
          title: "Conexão bem-sucedida",
          description: `Conectado com sucesso a ${apiUrl}`,
        })
      } else {
        toast({
          title: "Erro de conexão",
          description: `Não foi possível conectar a ${apiUrl}. Status: ${response.status}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: `Não foi possível conectar a ${apiUrl}`,
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">URL da API</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={newApiUrl}
              onChange={(e) => setNewApiUrl(e.target.value)}
              placeholder="https://exemplo.ngrok.app"
            />
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="font-mono text-sm">{apiUrl}</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={testConnection}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Testar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Para alterar permanentemente, atualize a variável de ambiente NEXT_PUBLIC_API_URL no Vercel.
        </p>
      </CardContent>
    </Card>
  )
}
