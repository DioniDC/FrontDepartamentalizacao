"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function ConnectionTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<Record<string, boolean>>({})

  const endpoints = [
    { name: "GSS/Subgrupos", path: "/api/cadgss" },
    { name: "Departamentos Nível 4", path: "/api/depnv4" },
    { name: "Departamentos", path: "/api/tabdep" },
    { name: "Grupos", path: "/api/tabgru" },
  ]

  const testEndpoint = async (path: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${path}`, {
        cache: "no-store", // Evitar problemas de cache
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  const testAllEndpoints = async () => {
    setTesting(true)
    const newResults: Record<string, boolean> = {}

    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.path)
      newResults[endpoint.name] = result
    }

    setResults(newResults)
    setTesting(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Teste de Endpoints</CardTitle>
          <Button onClick={testAllEndpoints} disabled={testing} size="sm">
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {testing ? "Testando..." : "Testar Endpoints"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {endpoints.map((endpoint) => (
            <div key={endpoint.name} className="flex items-center justify-between">
              <span className="text-sm">{endpoint.name}</span>
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : results[endpoint.name] !== undefined ? (
                <Badge variant={results[endpoint.name] ? "default" : "destructive"}>
                  {results[endpoint.name] ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {results[endpoint.name] ? "OK" : "Erro"}
                </Badge>
              ) : (
                <Badge variant="secondary">Não testado</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
