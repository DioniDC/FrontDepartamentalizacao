"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Nivel4Tab } from "@/components/departmentalization/nivel4-tab"
import { DepartamentoTab } from "@/components/departmentalization/departamento-tab"
import { GrupoTab } from "@/components/departmentalization/grupo-tab"
import { SubgrupoTab } from "@/components/departmentalization/subgrupo-tab"

export default function TabelasDepartamentalizacaoPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Tabelas de Departamentalização</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Hierarquia</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="nivel4" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="nivel4">Nível 4</TabsTrigger>
              <TabsTrigger value="departamento">Departamento</TabsTrigger>
              <TabsTrigger value="grupo">Grupo</TabsTrigger>
              <TabsTrigger value="subgrupo">Subgrupo</TabsTrigger>
            </TabsList>

            <TabsContent value="nivel4">
              <Nivel4Tab />
            </TabsContent>

            <TabsContent value="departamento">
              <DepartamentoTab />
            </TabsContent>

            <TabsContent value="grupo">
              <GrupoTab />
            </TabsContent>

            <TabsContent value="subgrupo">
              <SubgrupoTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
