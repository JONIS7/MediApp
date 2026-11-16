"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "../../components/AppLayout";
import {
  apiFetch,
  Appointment,
  Doctor,
  formatDateTimePtBr,
  Pacient,
} from "../../lib/api";

export default function AppointmentListPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pacients, setPacients] = useState<Pacient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "past">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<Appointment[]>("/appointments"),
      apiFetch<Doctor[]>("/doctors"),
      apiFetch<Pacient[]>("/pacients"),
    ])
      .then(([appts, docs, pats]) => {
        if (!active) return;
        setAppointments(Array.isArray(appts) ? appts : []);
        setDoctors(Array.isArray(docs) ? docs : []);
        setPacients(Array.isArray(pats) ? pats : []);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Erro ao carregar consultas."
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

  const filteredAppointments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...appointments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((appt) => {
        const isUpcoming = new Date(appt.date).getTime() >= now;
        if (statusFilter === "upcoming" && !isUpcoming) return false;
        if (statusFilter === "past" && isUpcoming) return false;
        if (!q) return true;
        const doc = doctorMap.get(appt.doctorId);
        const pat = pacientMap.get(appt.pacientId);
        return (
          (doc?.name || "").toLowerCase().includes(q) ||
          (doc?.medicalSpecialty || "").toLowerCase().includes(q) ||
          (pat?.name || "").toLowerCase().includes(q)
        );
      });
  }, [appointments, doctorMap, pacientMap, search, statusFilter, now]);

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente cancelar e excluir esta consulta?")) return;
    setError(null);
    try {
      await apiFetch(`/appointments/${id}`, { method: "DELETE" });
      setAppointments((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao excluir consulta."
      );
    }
  };

  return (
    <AppLayout
      title="Agenda de Consultas"
      subtitle="Acompanhe atendimentos agendados, realize remarcações ou emita receitas"
      action={
        <Link
          href="/appointment/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition"
        >
          + Agendar Consulta
        </Link>
      }
    >
      {error && (
        <div className="mb-4 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por paciente, médico ou especialidade..."
            className="w-full md:max-w-sm px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <div className="flex items-center gap-2">
            {(
              [
                ["all", "Todas"],
                ["upcoming", "Agendadas"],
                ["past", "Realizadas"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  statusFilter === value
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Data e Hora</th>
                <th className="px-5 py-3.5 font-semibold">Paciente</th>
                <th className="px-5 py-3.5 font-semibold">Médico</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.map((appt) => {
                const doc = doctorMap.get(appt.doctorId);
                const pat = pacientMap.get(appt.pacientId);
                const isUpcoming =
                  new Date(appt.date).getTime() >= now;
                return (
                  <tr key={appt._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                      {formatDateTimePtBr(appt.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">
                        {pat?.name || "Paciente não encontrado"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {pat?.phone || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">
                        {doc?.name || "Médico não encontrado"}
                      </p>
                      <p className="text-xs text-teal-600">
                        {doc?.medicalSpecialty || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isUpcoming
                            ? "bg-teal-50 text-teal-700 border border-teal-100"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isUpcoming ? "Agendada" : "Realizada"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-2">
                      <Link
                        href={`/prescription/create?appointmentId=${appt._id}`}
                        className="inline-flex px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold border border-teal-200 transition"
                      >
                        Emitir Receita
                      </Link>
                      <Link
                        href={`/appointment/edit/${appt._id}`}
                        className="inline-flex px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 transition"
                      >
                        Remarcar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(appt._id)}
                        className="inline-flex px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredAppointments.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    Nenhuma consulta encontrada.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    Carregando consultas...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
