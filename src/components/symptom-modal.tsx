"use client";

import { useState } from "react";
import type { BodyPart } from "./body-viewer";
import { log } from "console";
import { logSymptom } from "@/lib/actions/symptoms";

const SEVERITY = ["", "Mild", "Moderate", "Severe"];
const SEVERITY_COLORS = ["", "#4caf50", "#ff9800", "#f44336"];

type Props = {
  part: BodyPart | null;
  orgId: string;
  patientId: number;
  onSave: (data: { bodyPart: string; note: string; severity: number }) => void;
  onClose: () => void;
};

export function SymptomModal({
  part,
  orgId,
  patientId,
  onSave,
  onClose,
}: Props) {
  const [note, setNote] = useState("");
  const [severity, setSeverity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!part) return null;

  async function handleSave() {
    if (!part) return;
    setLoading(true);
    onSave({ bodyPart: part.id, note, severity });
    await logSymptom({ orgId, patientId, bodyPart: part.id, note, severity });
    setNote("");
    setSeverity(1);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-96 shadow-2xl">
        <div className="text-4xl mb-2">{part.emoji}</div>
        <h2 className="text-white font-bold text-xl mb-1">{part.label}</h2>
        <p className="text-slate-400 text-sm mb-6">
          Log a symptom for this area
        </p>

        {/* Severity */}
        <div className="mb-5">
          <label className="text-slate-400 text-xs tracking-widest">
            SEVERITY
          </label>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                style={{
                  flex: 1,
                  background: severity === s ? SEVERITY_COLORS[s] : "#1e293b",
                  color: severity === s ? "#fff" : "#64748b",
                }}
                className="py-2.5 rounded-lg font-semibold text-sm transition-all border-none cursor-pointer"
              >
                {SEVERITY[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <textarea
          rows={3}
          placeholder="Describe the symptom (optional)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm resize-none outline-none placeholder:text-slate-600"
        />

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-slate-700 text-slate-400 text-sm cursor-pointer bg-transparent"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-2 py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm cursor-pointer border-none"
          >
            {loading ? "Saving..." : "Log Symptom"}
          </button>
        </div>
      </div>
    </div>
  );
}
