import { Inter } from "next/font/google"
import "./globals.css"
import { ClientWrapper } from "@/components/ClientWrapper"
import { BancoAtivoBar } from "@/components/BancoAtivoBar"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ClientWrapper>
          <BancoAtivoBar />  {/* Adiciona o cabeçalho com banco ativo aqui */}
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}
