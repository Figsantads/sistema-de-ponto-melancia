export type Punches = {
  clockIn?: Date | null
  lunchStart?: Date | null
  lunchEnd?: Date | null
  clockOut?: Date | null
}

export type CalculationRules = {
  tolerancePerPunch: number
  dailyToleranceLimit: number
  dailyJourneyLimit: number
  dailyOvertimeLimit: number
}

export function minutesBetween(start: Date, end: Date) {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
}

export function calcularMinutosTrabalhados(punches: Punches) {
  if (!punches.clockIn || !punches.clockOut) return 0
  if (punches.lunchStart && punches.lunchEnd) {
    return minutesBetween(punches.clockIn, punches.lunchStart) + minutesBetween(punches.lunchEnd, punches.clockOut)
  }
  return minutesBetween(punches.clockIn, punches.clockOut)
}

export function aplicarTolerancia(rawMinutes: number, plannedMinutes: number, rules: CalculationRules) {
  const difference = rawMinutes - plannedMinutes
  const tolerance = Math.min(Math.abs(difference), rules.dailyToleranceLimit, rules.tolerancePerPunch * 2)
  return difference > 0 ? rawMinutes - tolerance : rawMinutes + tolerance
}

export function calcularSaldoDiario(rawMinutes: number, plannedMinutes: number, rules: CalculationRules) {
  const consideredMinutes = aplicarTolerancia(rawMinutes, plannedMinutes, rules)
  return { rawMinutes, consideredMinutes, plannedMinutes, balanceMinutes: consideredMinutes - plannedMinutes }
}

export function validarLimiteJornadaDiaria(workedMinutes: number, rules: CalculationRules) {
  return workedMinutes > rules.dailyJourneyLimit
}

export function validarLimiteHorasExtras(balanceMinutes: number, rules: CalculationRules) {
  return balanceMinutes > rules.dailyOvertimeLimit
}

export function compensarCreditosFIFO(credits: Array<{ id: number; remainingMinutes: number }>, requestedMinutes: number) {
  if (credits.reduce((total, credit) => total + credit.remainingMinutes, 0) < requestedMinutes) return { error: "Saldo insuficiente para esta compensação." }
  let remaining = requestedMinutes
  const consumed = credits.map((credit) => {
    const minutes = Math.min(credit.remainingMinutes, remaining)
    remaining -= minutes
    return { id: credit.id, consumedMinutes: minutes, remainingMinutes: credit.remainingMinutes - minutes }
  })
  return { consumed }
}

export function formatMinutes(total: number) {
  const sign = total < 0 ? "-" : "+"
  const absolute = Math.abs(total)
  return `${sign}${Math.floor(absolute / 60)}h${String(absolute % 60).padStart(2, "0")}`
}
