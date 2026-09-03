import { adminExists } from "@/app/actions/setup"
import { getCurrentStaff, getSession } from "@/lib/session"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function Home() {
  const session = await getSession()
  if (!session?.user) {
    // Enquanto não houver administrador, o primeiro acesso vai para a
    // configuração inicial em vez da tela de login.
    if (!(await adminExists())) redirect("/setup")
    redirect("/sign-in")
  }

  const profile = await getCurrentStaff()

  // Usuário autenticado mas sem perfil de staff (ex.: primeiro admin ainda
  // não configurado) vai para a rota de configuração inicial.
  if (!profile) redirect("/setup")

  if (profile.role === "admin") redirect("/admin")
  redirect("/painel")
}
