"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "../../components/AppLayout";
import { apiFetch, Appointment, formatDatePtBr, Pacient } from "../../lib/api";

export default function PacientListPage() {
  const [pacients, setPacients] = useState<Pacient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<Pacient[]>("/pacients"),
      apiFetch<Appointment[]>("/appointments"),
    ])
      .then(([pats, appts]) => {
        if (!active) return;
        setPacients(Array.isArray(pats) ? pats : []);
        setAppointments(Array.isArray(appts) ? appts : []);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Erro ao carregar pacientes."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const appointmentCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    for (const appt of appointments) {
      counts.set(appt.pacientId, (counts.get(appt.pacientId) || 0) + 1);
    }
    return counts;
  }, [appointments]);

  const filteredPacients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pacients;
    return pacients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.login.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q)
    );
  }, [pacients, search]);

  const handleDelete = async (pacient: Pacient) => {
    if (!confirm(`Deseja realmente excluir o paciente ${pacient.name}?`)) return;
    setError(null);
    try {
      await apiFetch(`/pacients/${pacient._id}`, { method: "DELETE" });
      setPacients((prev) => prev.filter((item) => item._id !== pacient._id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao excluir paciente."
      );
    }
  };

  return (
    <AppLayout
      title="Pacientes"
      subtitle="Gerencie os pacientes cadastrados e seu histórico de consultas"
      action={
        <Link
          href="/pacient/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition"
        >
          + Novo Paciente
        </Link>
      }
    >
      {error && (
        <div className="mb-4 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, login, e-mail ou telefone..."
            className="w-full sm:max-w-sm px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <span className="text-xs font-medium text-slate-500">
            {filteredPacients.length} paciente(s) encontrado(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Paciente</th>
                <th className="px-5 py-3.5 font-semibold">E-mail</th>
                <th className="px-5 py-3.5 font-semibold">Telefone</th>
                <th className="px-5 py-3.5 font-semibold">Consultas</th>
                <th className="px-5 py-3.5 font-semibold">Cadastro</th>
                <th className="px-5 py-3.5 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPacients.map((pacient) => {
                const count = appointmentCountMap.get(pacient._id) || 0;
                return (
                  <tr key={pacient._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">
                        {pacient.name}
                      </p>
                      <p className="text-xs text-slate-500">@{pacient.login}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {pacient.email}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">
                      {pacient.phone}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
                        {count} consulta(s)
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {formatDatePtBr(pacient.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-2">
                      <Link
                        href={`/pacient/edit/${pacient._id}`}
                        className="inline-flex px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 transition"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(pacient)}
                        className="inline-flex px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition cursor-pointer"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredPacients.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    Carregando pacientes...
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
