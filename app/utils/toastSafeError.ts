import { toast } from "@/hooks/use-toast"

// Função central de tratamento seguro de erros
export async function toastSafeError(response: Response, fallbackMessage = "Erro desconhecido") {
  let description = fallbackMessage

  try {
    const err = await response.json()
    if (Array.isArray(err.detail)) {
      description = err.detail.map((e: any) => e.msg).join(", ")
    } else if (typeof err.detail === "string") {
      description = err.detail
    } else {
      description = JSON.stringify(err.detail)
    }
  } catch (e) {
    description = fallbackMessage
  }

  toast({
    title: "Erro",
    description,
    variant: "destructive",
  })
}
