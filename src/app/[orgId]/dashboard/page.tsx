import { db } from "@/lib/db";
import { patients, appointments, prescriptions } from "@/lib/db/schema";
import { getSymptomsForPatient } from "@/lib/actions/symptoms";
import { eq, and, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

type Props = {
  params: Promise<{ orgId: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { orgId } = await params;

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.orgId, orgId))
    .limit(1);

  if (!patient) notFound();

  const initialSymptoms = await getSymptomsForPatient(orgId, patient.id);

  const [nextAppointment] = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.patientId, patient.id),
        eq(appointments.orgId, orgId),
        eq(appointments.status, "upcoming"),
      ),
    )
    .orderBy(asc(appointments.scheduledAt))
    .limit(1);

  const visitHistory = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.patientId, patient.id),
        eq(appointments.orgId, orgId),
      ),
    )
    .orderBy(asc(appointments.scheduledAt));

    const patientPrescriptions = await db 
    .select()
    .from(prescriptions)
    .where(
        and(
            eq(prescriptions.patientId, patient.id),
            eq(prescriptions.orgId, orgId)
        )
    )

  return (
    <DashboardClient
      orgId={orgId}
      patient={patient}
      initialSymptoms={initialSymptoms}
      nextAppointment={nextAppointment ?? null}
      visitHistory={visitHistory}
      prescriptions={patientPrescriptions}
    />
  );
}
