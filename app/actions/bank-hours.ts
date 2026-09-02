"use server"

import { db } from "@/lib/db"
import { auditLogs, timeEvents, timeOffs } from "@/lib/db/schema"
import { getCurrentUserId, requireAdmin } from "@/lib/session"
import { compensarCreditosFIFO } from "@/lib/bank-hours"
import { and, asc, eq, gt } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getBankBalance(userId?: string) {
  const currentUserId = userId ?? await getCurrentUserId()
  const events = await db.select({ minutes: timeEvents.remainingMinutes }).from(timeEvents).where(and(eq(timeEvents.userId, currentUserId), eq(timeEvents.status, "ACTIVE")))
  return events.reduce((total, event) => total + event.minutes, 0)
}

export async function requestTimeOff(input: { kind: string; workDate: string; durationMinutes: number; originalPlannedMinutes: number; reason?: string }) {
  const userId = await getCurrentUserId()
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0) return { error: "Informe uma duração válida." }
  await db.insert(timeOffs).values({ ...input, userId, requestedBy: userId, status: "AGUARDANDO_APROVACAO" })
  revalidatePath("/painel")
  return { success: true }
}

export async function approveTimeOff(id: number, observation?: string) {
  const admin = await requireAdmin()
  const rows = await db.select().from(timeOffs).where(eq(timeOffs.id, id)).limit(1)
  const request = rows[0]
  if (!request || request.status !== "AGUARDANDO_APROVACAO") return { error: "Solicitação não encontrada ou já processada." }
  const credits = await db.select({ id: timeEvents.id, remainingMinutes: timeEvents.remainingMinutes }).from(timeEvents).where(and(eq(timeEvents.userId, request.userId), eq(timeEvents.kind, "CREDITO"), eq(timeEvents.status, "ACTIVE"), gt(timeEvents.remainingMinutes, 0))).orderBy(asc(timeEvents.sourceDate), asc(timeEvents.id))
  const result = compensarCreditosFIFO(credits, request.durationMinutes)
  if ("error" in result) return result
  for (const item of result.consumed ?? []) {
    if (item.consumedMinutes > 0) await db.update(timeEvents).set({ remainingMinutes: item.remainingMinutes, status: item.remainingMinutes === 0 ? "CONSUMED" : "ACTIVE" }).where(eq(timeEvents.id, item.id))
  }
  await db.update(timeOffs).set({ status: "APROVADA", compensatedMinutes: request.durationMinutes, approvedBy: admin.userId, approvedAt: new Date(), observation }).where(eq(timeOffs.id, id))
  await db.insert(auditLogs).values({ userId: admin.userId, action: "APPROVE", entity: "time_off", entityId: String(id), newValue: JSON.stringify({ status: "APROVADA", minutes: request.durationMinutes }), origin: "admin" })
  revalidatePath("/admin")
  revalidatePath("/painel")
  return { success: true }
}

export async function rejectTimeOff(id: number, observation?: string) {
  const admin = await requireAdmin()
  await db.update(timeOffs).set({ status: "REPROVADA", approvedBy: admin.userId, approvedAt: new Date(), observation }).where(eq(timeOffs.id, id))
  await db.insert(auditLogs).values({ userId: admin.userId, action: "REJECT", entity: "time_off", entityId: String(id), newValue: JSON.stringify({ status: "REPROVADA" }), origin: "admin" })
  revalidatePath("/admin")
  return { success: true }
}
