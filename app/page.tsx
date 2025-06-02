import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Settings, Table, BarChart3 } from "lucide-react"
import { ApiStatus } from "@/components/api-status"
import { ConnectionTest } from "@/components/connection-test"
import { ApiUrlDisplay } from "@/components/api-url-display"

export default function HomePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sistema de Departamentalização</h1>
        <p className="text-muted-foreground">Gerencie produtos e departamentos de forma eficiente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div>
          <ApiUrlDisplay />
        </div>
        <div>
          <ApiStatus />
        </div>
        <div>
          <ConnectionTest />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/cadastro-produtos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Cadastro de Produtos
              </CardTitle>
              <CardDescription>Cadastrar produtos com códigos de barras válidos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Gerencie produtos do DBF não encontrados no MySQL</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/corrigir-departamentalizacao">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Corrigir Departamentalização
              </CardTitle>
              <CardDescription>Corrigir subgrupos de produtos conforme MySQL</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Verificar e corrigir divergências de produtos</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tabelas-departamentalizacao">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Tabelas de Departamentalização
              </CardTitle>
              <CardDescription>Gerenciar níveis hierárquicos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Nível 4, Departamento, Grupo e Subgrupo</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/relatorios">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Relatórios
              </CardTitle>
              <CardDescription>Visualizar dados e estatísticas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Acompanhe o progresso e métricas</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
