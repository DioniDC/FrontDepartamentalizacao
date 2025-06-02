"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Settings, Table, BarChart3, Server, Link as LinkIcon, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { ApiStatus } from "@/components/api-status"
import { ConnectionTest } from "@/components/connection-test"
import { ApiUrlDisplay } from "@/components/api-url-display"

export default function HomePage() {
  const { theme, setTheme } = useTheme()

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
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Alternar tema</span>
        </Button>
      </div>

      {/* Cabeçalho */}
      <div className="mb-8 pt-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Sistema de Departamentalização</h1>
        <p className="text-muted-foreground">Gerencie produtos e departamentos de forma eficiente</p>
      </div>

      {/* Seção de Conexão */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Card da URL da API */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow border border-gray-200 hover:border-primary/20 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LinkIcon className="h-5 w-5 text-primary" />
              <span>URL da API</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ApiUrlDisplay />
          </CardContent>
        </Card>

        {/* Card de Status */}
        <Card className="hover:shadow-lg transition-shadow border border-gray-200 hover:border-primary/20 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Server className="h-5 w-5 text-primary" />
              <span>Status do Serviço</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ApiStatus />
            <ConnectionTest />
          </CardContent>
        </Card>
      </div>

      {/* Cards de Funcionalidades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/cadastro-produtos">
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
              <p className="text-sm text-muted-foreground line-clamp-2">
                Gerencie produtos do DBF não encontrados no MySQL
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/corrigir-departamentalizacao">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-primary/20 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-primary" />
                <span>Corrigir Departamentalização</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                Corrigir subgrupos de produtos conforme MySQL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Verificar e corrigir divergências de produtos
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tabelas-departamentalizacao">
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
              <p className="text-sm text-muted-foreground line-clamp-2">
                Nível 4, Departamento, Grupo e Subgrupo
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/relatorios">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-primary/20 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Relatórios</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                Visualizar dados e estatísticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Acompanhe o progresso e métricas
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}