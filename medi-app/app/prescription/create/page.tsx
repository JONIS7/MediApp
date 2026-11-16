"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "../../components/AppLayout";
import {
  apiFetch,
  Appointment,
  Doctor,
  formatDateTimePtBr,
  Pacient,
  Prescription,
  toDateInputValue,
} from "../../lib/api";

export default function PrescriptionCreatePage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pacients, setPacients] = useState<Pacient[]>([]);

  const [appointmentId, setAppointmentId] = useState("");
  const [date, setDate] = useState(() => toDateInputValue());
  const [medicine, setMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [autoGeneratePdf, setAutoGeneratePdf] = useState(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const queryAppointmentId =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("appointmentId") || ""
        : "";

    Promise.all([
      apiFetch<Appointment[]>("/appointments"),
      apiFetch<Doctor[]>("/doctors"),
      apiFetch<Pacient[]>("/pacients"),
    ])
      .then(([appts, docs, pats]) => {
        if (!active) return;
        const apptsList = Array.isArray(appts) ? appts : [];
        setAppointments(apptsList);
        setDoctors(Array.isArray(docs) ? docs : []);
        setPacients(Array.isArray(pats) ? pats : []);

        if (
          queryAppointmentId &&
          apptsList.some((a) => a._id === queryAppointmentId)
        ) {
          setAppointmentId(queryAppointmentId);
        } else if (apptsList.length > 0) {
          setAppointmentId(apptsList[0]._id);
        }
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar consultas vinculadas."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const doctorMap = useMemo(
    () => new Map(doctors.map((d) => [d._id, d])),
    [doctors]
  );
  const pacientMap = useMemo(
    () => new Map(pacients.map((p) => [p._id, p])),
    [pacients]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!appointmentId || !medicine.trim() || !dosage.trim()) {
      setError("Selecione a consulta e informe o medicamento e a posologia.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await apiFetch<Prescription>("/postPrescription", {
        method: "POST",
        body: JSON.stringify({
          appointmentId,
          date: date ? new Date(`${date}T12:00:00`).toISOString() : new Date().toISOString(),
          medicine: medicine.trim(),
          dosage: dosage.trim(),
          instructions: instructions.trim(),
        }),
      });

      if (autoGeneratePdf && created?._id) {
        await apiFetch(`/generatePrescriptions/${created._id}`);
      }

      router.push("/prescription/create/upload");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar prescrição."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout
      title="Nova Prescrição Médica"
      subtitle="Emita uma receita vinculada a uma consulta e gere o PDF automaticamente"
      action={
        <Link
          href="/prescription/create/upload"
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition"
        >
          ← Ver prescrições
        </Link>
      }
    >
      <div className="max-w-2xl bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            Carregando consultas disponíveis...
          </p>
        ) : appointments.length === 0 ? (
          <div className="p-5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm space-y-2">
            <p className="font-semibold">Nenhuma consulta encontrada.</p>
            <p>
              Para emitir uma prescrição, agende primeiro uma consulta ligando
              médico e paciente.
            </p>
            <Link
              href="/appointment/create"
              className="inline-block mt-2 px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold text-xs"
            >
              Agendar Consulta
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Consulta Vinculada *
              </label>
              <select
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {appointments.map((appt) => {
                  const doc = doctorMap.get(appt.doctorId);
                  const pat = pacientMap.get(appt.pacientId);
                  return (
                    <option key={appt._id} value={appt._id}>
                      {formatDateTimePtBr(appt.date)} —{" "}
                      {pat?.name || "Paciente"} ({doc?.name || "Médico"})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Data da Emissão *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Medicamento *
                </label>
                <input
                  type="text"
                  value={medicine}
                  onChange={(e) => setMedicine(e.target.value)}
                  placeholder="Ex: Dipirona Sódica 500mg"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Posologia / Dosagem *
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Ex: 1 comprimido a cada 6 horas em caso de dor ou febre"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Instruções Adicionais
              </label>
              <textarea
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex: Tomar com água após as refeições por até 5 dias."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <label className="flex items-center gap-2.5 text-sm text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGeneratePdf}
                onChange={(e) => setAutoGeneratePdf(e.target.checked)}
                className="w-4 h-4 accent-teal-600"
              />
              <span>
                Gerar arquivo PDF da receita automaticamente após salvar
              </span>
            </label>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <Link
                href="/prescription/create/upload"
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold shadow-sm transition cursor-pointer"
              >
                {submitting ? "Salvando..." : "Salvar Prescrição"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
