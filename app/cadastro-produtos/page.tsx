"use client"

import ProdutoClassificacaoPage from "@/components/produto-classificacao-page"
import { api } from "@/lib/api"
import { ProtectedPage } from "@/components/ProtectedPage"

export default function Page() {
  return (
    <ProtectedPage>
      <ProdutoClassificacaoPage
        titulo="Cadastro de Produtos"
        getProdutos={api.getProdutosCadastrarIA}
        processarProdutos={api.cadastrarProdutos}
        edicaoDescricaoHabilitada={true}
      />
    </ProtectedPage>
  )
}
