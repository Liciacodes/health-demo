"use server";

import { db }                    from "@/lib/db";
import { symptoms, patients }    from "@/lib/db/schema";
import { eq, and, desc }         from "drizzle-orm";
import { revalidatePath }        from "next/cache";
import type { NewSymptom, Symptom } from "@/lib/db/schema";


export async function logSymptom(data: {
  orgId:     string;
  patientId: number;
  bodyPart:  string;
  note?:     string;
  severity:  number;
}) {
 
  const [patient] = await db
    .select()
    .from(patients)
    .where(
      and(
        eq(patients.id,    data.patientId),
        eq(patients.orgId, data.orgId),      
      )
    )
    .limit(1);

  if (!patient) throw new Error("Patient not found in this organization");

  const newSymptom: NewSymptom = {
    orgId:     data.orgId,
    patientId: data.patientId,
    bodyPart:  data.bodyPart,
    note:      data.note ?? null,
    severity:  data.severity,
  };

  await db.insert(symptoms).values(newSymptom);
  revalidatePath(`/${data.orgId}/dashboard`);
}



export async function getSymptomsForPatient(orgId: string, patientId: number): Promise<Symptom[]> {
    return db 
    .select()
    .from(symptoms)
    .where(
        and(
            eq(symptoms.patientId, patientId),
            eq(symptoms.orgId, orgId)
        )
    )
    .orderBy(desc(symptoms.createdAt))
}


export async function deletesymptom(orgId: string, symptomId: number) {
    await db.delete(symptoms)
    .where(
        and(
            eq(symptoms.id, symptomId),
            eq(symptoms.orgId, orgId)
        )
    )

    revalidatePath(`/${orgId}/dashboard`);
}