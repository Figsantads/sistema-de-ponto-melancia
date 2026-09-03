import { adminExists } from "@/app/actions/setup"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { LoginForm } from "@/components/login-form"
import { MelanciaLogo } from "@/components/melancia-logo"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function SignInPage() {
  const session = await getSession()
  if (session?.user) redirect("/")

  // Sem administrador cadastrado ainda: envia para a configuração inicial.
  if (!(await adminExists())) redirect("/setup")

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <MelanciaLogo className="scale-125" />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-balance">
              Folha de Ponto
            </h1>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Entre com seu e-mail e senha para registrar seu ponto.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2" />
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground text-pretty">
          Não tem acesso? Solicite ao administrador a criação do seu usuário.
        </p>
      </div>
    </main>
  )
}
