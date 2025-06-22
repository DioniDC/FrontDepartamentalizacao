"use client"

import ProdutoClassificacaoPage from "@/components/produto-classificacao-page"
import { api } from "@/lib/api"
import { ProtectedPage } from "@/components/ProtectedPage"

export default function CorrigirTodosDbfPage() {
  return (
    <ProtectedPage>
      <ProdutoClassificacaoPage
        titulo="Corrigir CADPRO.DBF (com base no CADGSS.DBF)"
        getProdutos={api.corrigirTodosDbf} // você só precisa garantir que criou no api.ts
        processarProdutos={api.atualizarCodgss}
        edicaoDescricaoHabilitada={false}
      />
    </ProtectedPage>
  )
}
