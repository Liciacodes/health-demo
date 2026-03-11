// src/components/symptom-log.tsx
//
// No "use client" — this is a server component.
// It receives pre-fetched symptoms from page.tsx
// and just renders them. Pure, simple, fast.

import type { Symptom } from "@/lib/db/schema";
import { BODY_PARTS }   from "./body-viewer";
import { useState } from "react";
import { on } from "events";
import { deletesymptom } from "@/lib/actions/symptoms";

const SEVERITY_LABEL = ["", "Mild", "Moderate", "Severe"];
const SEVERITY_COLOR = ["", "#4caf50", "#ff9800", "#f44336"];

type Props = {
  symptoms: Symptom[];
  onSymptomDelete: (id: number) => void;
  orgId: string;
};

export function SymptomLog({ symptoms, onSymptomDelete, orgId }: Props) {

    const [deleteId, setDeleteId] = useState<number | null>(null);

    async function handleDelete(id: number) {
        setDeleteId(id);
        onSymptomDelete(id);
        await deletesymptom(orgId, id)
        setDeleteId(null);
    }
  return (
    <aside className="bg-slate-900 border-l border-slate-800 p-5 flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-white">Symptom Log</span>
        <span
          className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
          style={{ background: symptoms.length > 0 ? "#2196f3" : "#1e293b" }}
        >
          {symptoms.length}
        </span>
      </div>

      {symptoms.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500 text-center">
          <span className="text-3xl">🫀</span>
          <span className="text-sm">No symptoms logged yet</span>
          <span className="text-xs">Click a body part to get started</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {symptoms.map((sym) => {
            const part = BODY_PARTS.find((p) => p.id === sym.bodyPart);
            return (
              <div
                key={sym.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3"
                style={{ borderLeft: `3px solid ${SEVERITY_COLOR[sym.severity]}` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {part?.emoji} {part?.label}
                  </span>
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: SEVERITY_COLOR[sym.severity] + "33",
                      color:      SEVERITY_COLOR[sym.severity],
                    }}
                  >
                    {SEVERITY_LABEL[sym.severity]}
                  </span>
                  <button
                      onClick={() => handleDelete(sym.id)}
                      disabled={deleteId === sym.id}
                      className="text-slate-600 hover:text-red-400 transition-colors text-xs cursor-pointer bg-transparent border-none"
                    >
                      ✕
                    </button>
                </div>
                {sym.note && (
                  <p className="text-xs text-slate-400 mt-1">{sym.note}</p>
                )}
                <p className="text-xs text-slate-600 mt-1.5">
                  {sym.createdAt?.toLocaleTimeString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}