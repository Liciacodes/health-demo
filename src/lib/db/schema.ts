import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const symptoms = pgTable("symptoms", {
  id: serial("id").primaryKey(),
  orgId: text("org_id").notNull(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id),
  bodyPart: text("body_part").notNull(),
  note: text("note"),
  severity: integer("severity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  orgId: text("org_id").notNull(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id),
  provider: text("provider").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").notNull().default("upcoming"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const prescriptions = pgTable("prescriptions", {
    id: serial("id").primaryKey(),
    orgId: text("org_id").notNull(),    
    patientId: integer("patient_id")
      .notNull()
      .references(() => patients.id),
    medication: text("medication").notNull(),
    dosage: text("dosage").notNull(),
    frequency: text("frequency").notNull(),
    status: text("status").notNull().default("active"),
    prescribedBy: text("prescribed_by").notNull(),
    createdAt: timestamp('created_at').defaultNow()
});

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export type Symptom = typeof symptoms.$inferSelect;
export type NewSymptom = typeof symptoms.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;
