import { Nav }      from "@/components/nav";
import { db }       from "@/lib/db";
import { patients } from "@/lib/db/schema";
import { eq }       from "drizzle-orm";
import { notFound } from "next/navigation";

type Props = {
  children: React.ReactNode;
  params:   Promise<{ orgId: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { orgId } = await params;

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.orgId, orgId))
    .limit(1);

  if (!patient) notFound();

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      <Nav orgId={orgId} patient={patient} />
      {children}
    </div>
  );
}