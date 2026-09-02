import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  date,
  integer,
  unique,
} from "drizzle-orm/pg-core"

// ---------------------------------------------------------------------------
// Better Auth tables (do not rename columns — camelCase matches BA defaults)
// ---------------------------------------------------------------------------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  // Exigido pelo Better Auth 1.7 (identidade da conta escopada por issuer).
  issuer: text("issuer").notNull().default(""),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// ---------------------------------------------------------------------------
// App tables
// ---------------------------------------------------------------------------

// Perfil do colaborador + jornada de trabalho cadastrada pelo admin.
// "userId" referencia user.id do Better Auth (sem FK por escolha da skill).
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("employee"), // 'employee' | 'admin'
  entryTime: text("entryTime"), // "08:00"
  lunchStart: text("lunchStart"), // "12:00"
  lunchEnd: text("lunchEnd"), // "13:00"
  exitTime: text("exitTime"), // "18:00"
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Registro de ponto diário (um por colaborador por dia).
export const timeEntries = pgTable(
  "time_entries",
  {
    id: serial("id").primaryKey(),
    userId: text("userId").notNull(),
    workDate: date("workDate").notNull(),
    clockIn: timestamp("clockIn"),
    lunchStart: timestamp("lunchStart"),
    lunchEnd: timestamp("lunchEnd"),
    clockOut: timestamp("clockOut"),
    editedByAdmin: boolean("editedByAdmin").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => ({
    uniqueUserDate: unique().on(t.userId, t.workDate),
  }),
)

export const workSchedules = pgTable("work_schedules", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  weeklyMinutes: integer("weeklyMinutes").notNull().default(2640),
  dailyOvertimeLimit: integer("dailyOvertimeLimit").notNull().default(120),
  dailyJourneyLimit: integer("dailyJourneyLimit").notNull().default(600),
  tolerancePerPunch: integer("tolerancePerPunch").notNull().default(5),
  dailyToleranceLimit: integer("dailyToleranceLimit").notNull().default(10),
  compensationMonths: integer("compensationMonths").notNull().default(6),
  effectiveFrom: date("effectiveFrom").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const scheduleDays = pgTable("schedule_days", {
  id: serial("id").primaryKey(),
  scheduleId: integer("scheduleId").notNull(),
  weekday: integer("weekday").notNull(),
  plannedMinutes: integer("plannedMinutes").notNull().default(0),
})

export const timeEvents = pgTable("time_events", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  sourceDate: date("sourceDate").notNull(),
  kind: text("kind").notNull(),
  minutes: integer("minutes").notNull(),
  remainingMinutes: integer("remainingMinutes").notNull(),
  dueDate: date("dueDate"),
  origin: text("origin").notNull(),
  status: text("status").notNull().default("ACTIVE"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const occurrences = pgTable("occurrences", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  workDate: date("workDate").notNull(),
  kind: text("kind").notNull(),
  impact: integer("impact").notNull().default(0),
  reason: text("reason"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const timeOffs = pgTable("time_offs", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  kind: text("kind").notNull(),
  workDate: date("workDate").notNull(),
  durationMinutes: integer("durationMinutes").notNull(),
  originalPlannedMinutes: integer("originalPlannedMinutes").notNull(),
  compensatedMinutes: integer("compensatedMinutes").notNull().default(0),
  status: text("status").notNull().default("AGUARDANDO_APROVACAO"),
  reason: text("reason"),
  requestedBy: text("requestedBy").notNull(),
  approvedBy: text("approvedBy"),
  requestedAt: timestamp("requestedAt").notNull().defaultNow(),
  approvedAt: timestamp("approvedAt"),
  observation: text("observation"),
})

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entityId"),
  previousValue: text("previousValue"),
  newValue: text("newValue"),
  reason: text("reason"),
  origin: text("origin"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export type Staff = typeof staff.$inferSelect
export type TimeEntry = typeof timeEntries.$inferSelect
export type WorkSchedule = typeof workSchedules.$inferSelect
export type TimeEvent = typeof timeEvents.$inferSelect
