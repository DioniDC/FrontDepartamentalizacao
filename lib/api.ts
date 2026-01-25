// Configuração da API - fácil de alterar entre localhost e ngrok

import { ProdutosIAResponse } from "@/app/produtos-cadastrados/type"

// URL relativa - o nginx roteia /api/* para o backend
const API_BASE_URL = ""

// Função auxiliar para fazer requests com melhor tratamento de erro
async function apiRequest(url: string, options: RequestInit = {}) {
  const fullUrl = `${API_BASE_URL}${url}`

  console.log(`🔗 API Request: ${options.method || "GET"} ${fullUrl}`)

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      // Adicionar cache: 'no-store' para evitar problemas de cache
      cache: "no-store",
    })

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API Error Response:`, errorText)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`✅ API Success:`, data)
    return data
  } catch (error) {
    console.error(`🚨 API Request Failed:`, error)

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(`Não foi possível conectar com a API em ${API_BASE_URL}. Verifique se o servidor está rodando.`)
    }

    throw error
  }
}

export const api = {
  // Produtos
  async getProdutosCadastrarIA(): Promise<ProdutosIAResponse> {
    try {
      return await apiRequest("/api/produtos/cadastrar-ia")
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      throw new Error(`Erro ao buscar produtos para cadastro. Verifique a conexão com a API: ${API_BASE_URL}`)
    }
  },

  async corrigirTodosDbf(): Promise<ProdutosIAResponse> {
    try {
      return await apiRequest("/api/produtos/corrige-todos-dbf", {
        method: "POST",
      })
    } catch (error) {
      console.error("Erro ao corrigir todos os produtos do DBF:", error)
      throw new Error(`Erro ao corrigir todos os produtos do DBF. Verifique a conexão com a API: ${API_BASE_URL}`)
    }   
  },

  async getProdutosBalancaIA(): Promise<ProdutosIAResponse> {
    try {
      return await apiRequest("/api/produtos/balanca-barras-gerado-ia")
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      throw new Error(`Erro ao buscar produtos para cadastro. Verifique a conexão com a API: ${API_BASE_URL}`)
    }
  },

  async cadastrarProdutos(produtos: any[]) {
    try {
      return await apiRequest("/api/produtos/cadastrar", {
        method: "POST",
        body: JSON.stringify(produtos),
      })
    } catch (error) {
      console.error("Erro ao cadastrar produtos:", error)
      throw new Error(`Erro ao cadastrar produtos. Verifique a conexão com a API: ${API_BASE_URL}`)
    }
  },

  async getCorrigirProdutos() {
    try {
      return await apiRequest("/api/produtos/corrigir")
    } catch (error) {
      console.error("Erro ao buscar divergências:", error)
      throw new Error(`Erro ao buscar divergências. Verifique a conexão com a API: ${API_BASE_URL}`)
    }
  },

  async atualizarCodgss(produtos: any[]) {
    try {
      return await apiRequest("/api/produtos/atualizar_codgss", {
        method: "POST",
        body: JSON.stringify(produtos),
      })
    } catch (error) {
      console.error("Erro ao atualizar produtos:", error)
      throw new Error(`Erro ao atualizar códigos GSS. Verifique a conexão com a API: ${API_BASE_URL}`)
    }
  },

  // GSS
  async getCadgss() {
    try {
      return await apiRequest("/api/cadgss")
    } catch (error) {
      console.error("Erro ao buscar GSS:", error)
      throw new Error(`Erro ao buscar subgrupos GSS. Verifique a conexão com a API: ${API_BASE_URL}`)
    }
  },

  async createOrUpdateCadgss(data: any) {
    try {
      return await apiRequest("/api/cadgss", {
        method: "POST",
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error("Erro ao salvar GSS:", error)
      throw new Error(`Erro ao salvar subgrupo GSS. Verifique a conexão com a API: ${API_BASE_URL}`)
    }
  },

  // Departamentos Nível 4
  async getDepnv4() {
    try {
      return await apiRequest("/api/depnv4")
    } catch (error) {
      console.error("Erro ao buscar departamentos nível 4:", error)
      throw new Error(`Erro ao buscar departamentos nível 4. Verifique a conexão com a API: ${API_BASE_URL}`)
    }
  },

  async createOrUpdateDepnv4(data: any) {
    try {
      return await apiRequest("/api/depnv4", {
        method: "POST",
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error("Erro ao salvar departamento nível 4:", error)
      throw new Error(`Erro ao salvar departamento nível 4. Verifique a conexão com a API: ${API_BASE_URL}`)
    }
  },

  // Departamentos
  async getTabdep() {
    try {
      return await apiRequest("/api/tabdep")
    } catch (error) {
      console.error("Erro ao buscar departamentos:", error)
      throw new Error(`Erro ao buscar departamentos. Verifique a conexão com a API: ${API_BASE_URL}`)
    }
  },

  async createOrUpdateTabdep(data: any) {
    try {
      return await apiRequest("/api/tabdep", {
        method: "POST",
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error("Erro ao salvar departamento:", error)
      throw new Error(`Erro ao salvar departamento. Verifique a conexão com a API: ${API_BASE_URL}`)
    }
  },

  // Grupos
  async getTabgru() {
    try {
      return await apiRequest("/api/tabgru")
    } catch (error) {
      console.error("Erro ao buscar grupos:", error)
      throw new Error(`Erro ao buscar grupos. Verifique a conexão com a API: ${API_BASE_URL}`)
    }
  },

  async createOrUpdateTabgru(data: any) {
    try {
      return await apiRequest("/api/tabgru", {
        method: "POST",
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error("Erro ao salvar grupo:", error)
      throw new Error(`Erro ao salvar grupo. Verifique a conexão com a API: ${API_BASE_URL}`)
    }
  },

  // Função para testar conectividade
  async testConnection() {
    try {
      // Usar a rota /api/cadgss que sabemos que funciona
      const response = await fetch(`${API_BASE_URL}/api/depnv4`, {
        method: "get",
        cache: "no-store",
      })
      return response.ok
    } catch (error) {
      console.error("Erro ao testar conexão:", error)
      return false
    }
  },
}
