"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"

export function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking")
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    checkApiStatus()
  }, [])

  const checkApiStatus = async () => {
    setChecking(true)
    try {
      const isOnline = await api.testConnection()
      setStatus(isOnline ? "online" : "offline")
    } catch (error) {
      console.error("Erro ao verificar status da API:", error)
      setStatus("offline")
    } finally {
      setChecking(false)
    }
  }

  const getStatusIcon = () => {
    if (checking) return <RefreshCw className="h-4 w-4 animate-spin" />

    switch (status) {
      case "checking":
        return <AlertCircle className="h-4 w-4" />
      case "online":
        return <CheckCircle className="h-4 w-4" />
      case "offline":
        return <XCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "checking":
        return "secondary"
      case "online":
        return "default"
      case "offline":
        return "destructive"
    }
  }

  const getStatusText = () => {
    if (checking) return "Verificando..."

    switch (status) {
      case "checking":
        return "Verificando..."
      case "online":
        return "API Online"
      case "offline":
        return "API Offline"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Status da API</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor()} className="flex items-center gap-1">
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
            <Button variant="ghost" size="sm" onClick={checkApiStatus} disabled={checking}>
              <RefreshCw className={`h-3 w-3 ${checking ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        {status === "offline" && (
          <div className="mt-2 text-xs text-destructive">
            ⚠️ Verifique se o servidor está rodando e a URL está correta
          </div>
        )}
      </CardContent>
    </Card>
  )
}
