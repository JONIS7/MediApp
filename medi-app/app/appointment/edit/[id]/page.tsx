"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "../../../components/AppLayout";
import {
  apiFetch,
  Appointment,
  Doctor,
  Pacient,
  toDateTimeLocalValue,
} from "../../../lib/api";

export default function AppointmentEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pacients, setPacients] = useState<Pacient[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [pacientId, setPacientId] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    Promise.all([
      apiFetch<Appointment>(`/appointments/${id}`),
      apiFetch<Doctor[]>("/doctors"),
      apiFetch<Pacient[]>("/pacients"),
    ])
      .then(([appt, docs, pats]) => {
        if (!active) return;
        setDoctors(Array.isArray(docs) ? docs : []);
        setPacients(Array.isArray(pats) ? pats : []);
        setDoctorId(appt.doctorId || "");
        setPacientId(appt.pacientId || "");
        setDate(toDateTimeLocalValue(appt.date));
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Erro ao carregar consulta."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!doctorId || !pacientId || !date) {
      setError("Preencha médico, paciente e data/hora.");
      return;
    }

    setSaving(true);
    try {
      await apiFetch(`/appointments/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          doctorId,
          pacientId,
          date: new Date(date).toISOString(),
        }),
      });
      router.push("/appointment/list");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar consulta."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout
      title="Remarcar / Editar Consulta"
      subtitle="Altere data, horário, médico ou paciente do agendamento"
      action={
        <Link
          href="/appointment/list"
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition"
        >
          ← Voltar à agenda
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
            Carregando dados da consulta...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Médico Responsável *
              </label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} — {doc.medicalSpecialty} (
                    {doc.medicalRegistration})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Paciente *
              </label>
              <select
                value={pacientId}
                onChange={(e) => setPacientId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {pacients.map((pac) => (
                  <option key={pac._id} value={pac._id}>
                    {pac.name} — {pac.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nova Data e Horário *
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <Link
                href="/appointment/list"
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold shadow-sm transition cursor-pointer"
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
