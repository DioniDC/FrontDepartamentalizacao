export interface ProdutosIAResponse {
  produtos: Produto[]
  total_disponivel: number
  total_processado: number
}

export interface Produto {
  codpro01: number
  descpro01: string
  codgss_sug: number
  descgss_sug: string
}