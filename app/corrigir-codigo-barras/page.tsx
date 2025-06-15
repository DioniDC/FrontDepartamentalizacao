"use client"

import ProdutoClassificacaoPage from "@/components/produto-classificacao-page"
import { ProtectedPage } from "@/components/ProtectedPage"
import { api } from "@/lib/api"

export default function CorrigirCodigoBarrasPage() {
  return (
    <ProtectedPage>
      <ProdutoClassificacaoPage
        titulo="Correção de Produtos (Produtos de balança e Código de Barras gerado)"
        getProdutos={api.getProdutosBalancaIA}
        processarProdutos={api.atualizarCodgss}
        edicaoDescricaoHabilitada={false}
      />
    </ProtectedPage>
  )
}
