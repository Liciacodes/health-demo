import type { Patient } from "@/lib/db/schema";

type NavProps = { orgId: string; patient: Patient };

export function Nav({ orgId, patient }: NavProps) {
  const initials = patient.name.split(" ").map((n) => n[0]).join("");

  return (
    <nav className="flex items-center justify-between px-4 md:px-7 py-3 md:py-3.5 border-b border-slate-800 bg-slate-900">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center text-sm">⚕</div>
        <span className="font-bold text-base tracking-tight text-white">
          health <span className="text-blue-400">demo</span>
        </span>
        <span className="hidden sm:inline ml-2 text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
          /{orgId}
        </span>
      </div>
      <div className="flex items-center gap-2 md:gap-2.5">
        <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-sm font-bold text-white">
          {initials}
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-semibold text-white">{patient.name}</div>
          <div className="text-xs text-slate-500">Patient</div>
        </div>
      </div>
    </nav>
  );
}