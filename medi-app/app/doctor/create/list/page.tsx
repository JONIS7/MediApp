"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "../../../components/AppLayout";
import { apiFetch, Doctor } from "../../../lib/api";

export default function DoctorListPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<Doctor[]>("/doctors")
      .then((data) => {
        if (active) setDoctors(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Erro ao carregar médicos"
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.medicalSpecialty.toLowerCase().includes(q) ||
        d.medicalRegistration.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q)
    );
  }, [doctors, search]);

  const handleDelete = async (doctor: Doctor) => {
    if (!confirm(`Deseja realmente excluir ${doctor.name}?`)) return;
    setError(null);
    try {
      await apiFetch(`/doctors/${doctor._id}`, { method: "DELETE" });
      setDoctors((prev) => prev.filter((item) => item._id !== doctor._id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir médico");
    }
  };

  return (
    <AppLayout
      title="Corpo Clínico"
      subtitle="Gerencie os médicos cadastrados e suas especialidades"
      action={
        <Link
          href="/doctor/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition"
        >
          + Novo Médico
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
            placeholder="Buscar por nome, especialidade, CRM ou e-mail..."
            className="w-full sm:max-w-sm px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <span className="text-xs font-medium text-slate-500">
            {filteredDoctors.length} profissional(is) encontrado(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Médico</th>
                <th className="px-5 py-3.5 font-semibold">Especialidade</th>
                <th className="px-5 py-3.5 font-semibold">CRM</th>
                <th className="px-5 py-3.5 font-semibold">Contato</th>
                <th className="px-5 py-3.5 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor._id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-900">{doctor.name}</p>
                    <p className="text-xs text-slate-500">@{doctor.login}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
                      {doctor.medicalSpecialty}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-700">
                    {doctor.medicalRegistration}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-slate-700">{doctor.email}</p>
                    <p className="text-xs text-slate-500">{doctor.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-2">
                    <Link
                      href={`/doctor/edit/${doctor._id}`}
                      className="inline-flex px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 transition"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(doctor)}
                      className="inline-flex px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition cursor-pointer"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredDoctors.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    Nenhum médico encontrado.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    Carregando médicos...
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
