"use client";

import { useState } from "react";
import { BodyViewer } from "@/components/body-viewer";
import { SymptomModal } from "@/components/symptom-modal";
import { SymptomLog } from "@/components/symptom-log";
import { getSymptomsForPatient,  logSymptom } from "@/lib/actions/symptoms";
import type { Appointment, Patient, Prescription, Symptom } from "@/lib/db/schema";
import type { BodyPart } from "@/components/body-viewer";

type Props = {
  orgId: string;
  patient: Patient;
  initialSymptoms: Symptom[];
  nextAppointment: { scheduledAt: Date; provider: string } | null;
  visitHistory: Appointment[];
  prescriptions: Prescription[];
};

const NAV_ITEMS = [
  { id: "body",    icon: "🫀", label: "Body Map" },
  { id: "history", icon: "📋", label: "Visit History" },
  { id: "rx",      icon: "💊", label: "Prescriptions" },
  { id: "msgs",    icon: "💬", label: "Messages" },
];

export function DashboardClient({
  orgId, patient, initialSymptoms, nextAppointment, visitHistory, prescriptions,
}: Props) {
  const [symptoms, setSymptoms]       = useState<Symptom[]>(initialSymptoms);
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [activeTab, setActiveTab]     = useState("body");
  const [showSymptomLog, setShowSymptomLog] = useState(false);

  const activePartIds = [...new Set(symptoms.map((s) => s.bodyPart))];
  const activePartIdsKey = activePartIds.join(",");

  async function handleSaveSymptom(data: {
    bodyPart: string; note: string; severity: number; id?: number; isUpdate?: boolean;
  }) {
    if (data.isUpdate && data.id) {
      setSymptoms(prev => prev.map(s =>
        s.id === data.id ? { ...s, note: data.note, severity: data.severity } : s
      ));
  } else {
  const optimistic: Symptom = {
    id: Date.now(), orgId, patientId: patient.id,
    bodyPart: data.bodyPart, note: data.note,
    severity: data.severity, createdAt: new Date(),
  };
  setSymptoms(prev => [optimistic, ...prev]);

  // replace fake id with real DB id
  const fresh = await getSymptomsForPatient(orgId, patient.id);
  setSymptoms(fresh);
}
  }

  function handleDeleteSymptom(id: number) {
    setSymptoms((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="flex flex-1 overflow-hidden">

      {/* ── SIDEBAR (desktop only) ── */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 p-5 flex-col gap-1.5 overflow-y-auto shrink-0">
        <div className="text-xs text-slate-500 tracking-widest mb-2">OVERVIEW</div>

        <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-3.5 mb-3">
          <div className="text-xs text-blue-400 mb-1">NEXT APPOINTMENT</div>
          {nextAppointment ? (
            <>
              <div className="text-sm font-semibold text-white">
                {nextAppointment.scheduledAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {" · "}
                {nextAppointment.scheduledAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{nextAppointment.provider}</div>
            </>
          ) : (
            <div className="text-sm text-slate-500">No upcoming appointments</div>
          )}
        </div>

        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm cursor-pointer bg-transparent border-none text-left w-full transition-all"
            style={{
              background:  activeTab === item.id ? "rgba(33,150,243,0.13)" : "transparent",
              borderLeft:  activeTab === item.id ? "3px solid #2196f3" : "3px solid transparent",
              color:       activeTab === item.id ? "#fff" : "#64748b",
              fontWeight:  activeTab === item.id ? 600 : 400,
            }}
          >
            <span>{item.icon}</span> {item.label}
          </button>
        ))}

        <div className="mt-auto pt-4 text-xs text-slate-600">
          <div>Patient ID: HD-{patient.name.replace(" ", "").slice(0, 6).toUpperCase()}</div>
          <div className="mt-1">{patient.email}</div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 md:px-6 pt-4 md:pt-5 pb-0 shrink-0">
          <h1 className="text-lg md:text-xl font-bold text-white">
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1 mb-3 md:mb-4">
            {activeTab === "body"    ? "Tap any body part to log a symptom" :
             activeTab === "history" ? "Your past and upcoming appointments" :
             activeTab === "rx"      ? "Your active prescriptions" :
             "Your messages with your care team"}
          </p>
        </div>

        {activeTab === "body" ? (
          <div className="flex-1 relative min-h-0">
            <BodyViewer onPartClick={setSelectedPart} activePartIds={activePartIds}   activePartIdsKey={activePartIdsKey}/>
            {/* Mobile symptom log button */}
            <button
              onClick={() => setShowSymptomLog(true)}
              className="md:hidden absolute top-3 right-3 bg-slate-900/90 border border-slate-700 rounded-full px-3 py-1.5 text-xs text-white flex items-center gap-1.5"
            >
              🫀 <span>{symptoms.length}</span>
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700 text-xs text-slate-400 whitespace-nowrap">
              🖱 Tap a body part to log · Hover to highlight
            </div>
          </div>
        ) : activeTab === "history" ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="flex flex-col gap-3">
              {visitHistory.length === 0 ? (
                <div className="text-slate-500 text-sm">No visit history yet</div>
              ) : (
                visitHistory.map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                    style={{ borderLeft: `3px solid ${appt.status === "upcoming" ? "#2196f3" : appt.status === "done" ? "#4caf50" : "#64748b"}` }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm font-semibold text-white">
                        {appt.scheduledAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}
                        {appt.scheduledAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{
                          background: appt.status === "upcoming" ? "#2196f333" : appt.status === "done" ? "#4caf5033" : "#64748b33",
                          color:      appt.status === "upcoming" ? "#2196f3"   : appt.status === "done" ? "#4caf50"   : "#64748b",
                        }}
                      >{appt.status}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{appt.provider}</div>
                    {appt.notes && <div className="text-xs text-slate-500 mt-2">{appt.notes}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === "rx" ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="flex flex-col gap-3">
              {prescriptions.length === 0 ? (
                <div className="text-slate-500 text-sm">No prescriptions yet</div>
              ) : (
                prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                    style={{ borderLeft: `3px solid ${rx.status === "active" ? "#4caf50" : "#64748b"}` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">💊 {rx.medication}</span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: rx.status === "active" ? "#4caf5033" : "#64748b33", color: rx.status === "active" ? "#4caf50" : "#64748b" }}
                      >{rx.status}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{rx.dosage} · {rx.frequency}</div>
                    <div className="text-xs text-slate-500 mt-1">Prescribed by {rx.prescribedBy}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Built with Next.js server components + Drizzle queries
          </div>
        )}

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="md:hidden flex border-t border-slate-800 bg-slate-900 shrink-0">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex-1 flex flex-col items-center py-3 gap-1 bg-transparent border-none cursor-pointer"
              style={{ color: activeTab === item.id ? "#2196f3" : "#64748b" }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.label.split(" ")[0]}</span>
            </button>
          ))}
        </nav>
      </main>

      {/* ── RIGHT PANEL (desktop only) ── */}
      <div className="hidden md:block w-72 shrink-0">
        <SymptomLog symptoms={symptoms} orgId={orgId} onSymptomDelete={handleDeleteSymptom} />
      </div>

      {/* ── MOBILE SYMPTOM LOG SHEET ── */}
      {showSymptomLog && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSymptomLog(false)} />
          <div className="relative bg-slate-900 rounded-t-2xl max-h-[70vh] flex flex-col z-50">
            <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-white">Symptom Log</span>
              <button onClick={() => setShowSymptomLog(false)} className="text-slate-400 bg-transparent border-none cursor-pointer text-lg">✕</button>
            </div>
            <div className="overflow-y-auto flex-1">
              <SymptomLog symptoms={symptoms} orgId={orgId} onSymptomDelete={handleDeleteSymptom} />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ── */}
      <SymptomModal
        key={selectedPart?.id}
        part={selectedPart}
        orgId={orgId}
        patientId={patient.id}
        onSave={handleSaveSymptom}
        onClose={() => setSelectedPart(null)}
        existingSymptoms={symptoms}
      />
    </div>
  );
}