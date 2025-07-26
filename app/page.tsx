"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Settings, Table, BarChart3, RefreshCw, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApiStatus } from "@/components/api-status"

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const [totalProdutos, setTotalProdutos] = useState<number | null>(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://192.168.237.85:8000"

  useEffect(() => {
    fetch(`${apiUrl}/api/produtos/cadastrados?limit=1`)
      .then(res => res.json())
      .then(data => setTotalProdutos(data.total))
      .catch(() => setTotalProdutos(null))
  }, [])

  return (
    <div className="container mx-auto p-4 md:p-6 relative">

      {/* Botão de Tema */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Alternar tema</span>
        </Button>
      </div>

      {/* Cabeçalho */}
      <div className="mb-8 pt-10 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Sistema de Departamentalização</h1>
        <p className="text-muted-foreground">Gerencie produtos e departamentos de forma eficiente</p>
        {/* Status do Serviço */}
        <div className="mt-4 flex justify-center md:justify-start">
          <ApiStatus />
        </div>
      </div>

      {/* 3 PRINCIPAIS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        {/* 1. Cadastro de Produtos */}
        <Link href="/cadastro-produtos" className="block h-full">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-primary/20 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                <span>Cadastro de Produtos</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                Cadastrar produtos com códigos de barras válidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Produtos do DBF não encontrados no MySQL
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* 2. Corrigir Código de Barras */}
        <Link href="/corrigir-codigo-barras" className="block h-full">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-primary/20 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Corrigir Código de Barras</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                Ajustar produtos de balança ou com códigos de barras gerados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                (Apenas corrige o DBF com sugestão da IA)
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* 3. Corrigir Departamentalização */}
        <Link href="/corrigir-departamentalizacao" className="block h-full">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-primary/20 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-primary" />
                <span>Corrigir Departamentalização</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                Corrigir subgrupos de produtos conforme está no MySQL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                (Importante passar antes pela opção "Cadastro de Produtos")
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* CARDS SECUNDÁRIOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Corrigir Todos Produtos (DBF) */}
        <Link href="/corrigir-todos-produtos-apenas-dbf" className="block h-full">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-primary/20 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <RefreshCw className="h-5 w-5 text-primary" />
                <span>Corrigir Todos Produtos (DBF)</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                Atualiza CADPRO.DBF com base no CADGSS.DBF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sincronização completa dos produtos apenas no DBF
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Tabelas de Departamentalização */}
        <Link href="/tabelas-departamentalizacao" className="block h-full">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-primary/20 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Table className="h-5 w-5 text-primary" />
                <span>Tabelas de Departamentalização</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                Gerenciar níveis hierárquicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Nível 4, Departamento, Grupo e Subgrupo
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Configurações */}
        <Link href="/configuracoes" className="block h-full">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-primary/20 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-primary" />
                <span>Configurações</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                Configurações do sistema e conexões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gerenciar bancos e arquivos DBF
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Produtos Cadastrados */}
        <Link href="/produtos-cadastrados" className="block h-full">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-primary/20 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Table className="h-5 w-5 text-primary" />
                <span>Ver Produtos Cadastrados SQL</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                Listagem de produtos já presentes no banco
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
