import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMinutes } from "@/lib/bank-hours"

export function BankHoursSummary({ balance, pendingPunch }: { balance: number; pendingPunch: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Saldo atual</CardTitle></CardHeader>
        <CardContent><p className="font-display text-4xl font-semibold tabular-nums">{formatMinutes(balance)}</p><p className="mt-1 text-sm text-muted-foreground">Composição calculada pelos eventos do banco.</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Você precisa resolver</CardTitle></CardHeader>
        <CardContent>{pendingPunch ? <p className="font-medium text-destructive">Falta uma marcação no período recente.</p> : <p className="font-medium text-primary">Nenhuma pendência de marcação.</p>}<p className="mt-1 text-sm text-muted-foreground">Consulte o histórico para conferir os detalhes.</p></CardContent>
      </Card>
    </div>
  )
}
