"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "../../components/AppLayout";
import {
  apiFetch,
  Doctor,
  Pacient,
  toDateTimeLocalValue,
} from "../../lib/api";

export default function AppointmentCreatePage() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pacients, setPacients] = useState<Pacient[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [pacientId, setPacientId] = useState("");
  const [date, setDate] = useState(() =>
    toDateTimeLocalValue(new Date(Date.now() + 3600000).toISOString())
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<Doctor[]>("/doctors"),
      apiFetch<Pacient[]>("/pacients"),
    ])
      .then(([docs, pats]) => {
        if (!active) return;
        const docsList = Array.isArray(docs) ? docs : [];
        const patsList = Array.isArray(pats) ? pats : [];
        setDoctors(docsList);
        setPacients(patsList);
        if (docsList.length > 0) setDoctorId(docsList[0]._id);
        if (patsList.length > 0) setPacientId(patsList[0]._id);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar médicos e pacientes."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!doctorId || !pacientId || !date) {
      setError("Selecione o médico, o paciente e a data/hora da consulta.");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId,
          pacientId,
          date: new Date(date).toISOString(),
        }),
      });
      router.push("/appointment/list");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao agendar consulta."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout
      title="Agendar Consulta"
      subtitle="Vincule um paciente a um profissional médico em data e horário"
      action={
        <Link
          href="/appointment/list"
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition"
        >
          ← Ver agenda
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
            Carregando médicos e pacientes...
          </p>
        ) : doctors.length === 0 || pacients.length === 0 ? (
          <div className="p-5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm space-y-2">
            <p className="font-semibold">
              Cadastros necessários antes de agendar:
            </p>
            <p>
              É preciso ter ao menos um médico ({doctors.length} cadastrado) e
              um paciente ({pacients.length} cadastrado).
            </p>
          </div>
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
                Data e Horário da Consulta *
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
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold shadow-sm transition cursor-pointer"
              >
                {submitting ? "Agendando..." : "Confirmar Agendamento"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
