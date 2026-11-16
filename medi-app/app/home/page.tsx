"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "../components/AppLayout";
import {
  apiFetch,
  Appointment,
  Doctor,
  formatDatePtBr,
  formatDateTimePtBr,
  Pacient,
  Prescription,
} from "../lib/api";

export default function DashboardPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pacients, setPacients] = useState<Pacient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        const [docs, pats, appts, prescs] = await Promise.all([
          apiFetch<Doctor[]>("/doctors"),
          apiFetch<Pacient[]>("/pacients"),
          apiFetch<Appointment[]>("/appointments"),
          apiFetch<Prescription[]>("/prescriptions"),
        ]);
        if (!active) return;
        setDoctors(Array.isArray(docs) ? docs : []);
        setPacients(Array.isArray(pats) ? pats : []);
        setAppointments(Array.isArray(appts) ? appts : []);
        setPrescriptions(Array.isArray(prescs) ? prescs : []);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboard();
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

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [appointments]);

  const sortedPrescriptions = useMemo(() => {
    return [...prescriptions].sort((a, b) => {
      const da = new Date(a.date || a.createdAt || 0).getTime();
      const db = new Date(b.date || b.createdAt || 0).getTime();
      return db - da;
    });
  }, [prescriptions]);

  const stats = [
    {
      label: "Médicos Cadastrados",
      value: doctors.length,
      href: "/doctor/create/list",
      color: "bg-teal-50 text-teal-700 border-teal-100",
      badge: "Corpo Clínico",
    },
    {
      label: "Pacientes Ativos",
      value: pacients.length,
      href: "/pacient/list",
      color: "bg-sky-50 text-sky-700 border-sky-100",
      badge: "Prontuários",
    },
    {
      label: "Consultas Registradas",
      value: appointments.length,
      href: "/appointment/list",
      color: "bg-indigo-50 text-indigo-700 border-indigo-100",
      badge: "Agenda",
    },
    {
      label: "Receitas Emitidas",
      value: prescriptions.length,
      href: "/prescription/create/upload",
      color: "bg-amber-50 text-amber-700 border-amber-100",
      badge: "Receituário PDF",
    },
  ];

  const quickActions = [
    {
      href: "/appointment/create",
      title: "Agendar Consulta",
      desc: "Vincular médico, paciente e horário",
      accent: "bg-teal-600 hover:bg-teal-700 text-white",
    },
    {
      href: "/pacient/create",
      title: "Novo Paciente",
      desc: "Cadastrar ficha do paciente",
      accent: "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200",
    },
    {
      href: "/doctor/create",
      title: "Novo Médico",
      desc: "Adicionar especialista ao corpo clínico",
      accent: "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200",
    },
    {
      href: "/prescription/create",
      title: "Nova Prescrição",
      desc: "Emitir receita médica digital",
      accent: "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200",
    },
  ];

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Visão geral da clínica, atendimentos e prescrições"
      action={
        <Link
          href="/appointment/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition"
        >
          + Nova Consulta
        </Link>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-teal-300 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${item.color}`}
              >
                {item.badge}
              </span>
              <span className="text-xs text-slate-400">Ver todos →</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">
                {loading ? "—" : item.value}
              </p>
              <p className="text-sm text-slate-500 mt-1">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Ações rápidas */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`rounded-xl p-4 shadow-xs transition block ${action.accent}`}
            >
              <p className="font-semibold text-sm">{action.title}</p>
              <p className="text-xs opacity-80 mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Tabelas recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultas */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Consultas Recentes e Agendadas
              </h2>
              <p className="text-xs text-slate-500">
                Últimos registros da agenda clínica
              </p>
            </div>
            <Link
              href="/appointment/list"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              Ver agenda →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Paciente</th>
                  <th className="px-5 py-3 font-semibold">Médico</th>
                  <th className="px-5 py-3 font-semibold">Data/Hora</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedAppointments.slice(0, 5).map((appt) => {
                  const doc = doctorMap.get(appt.doctorId);
                  const pat = pacientMap.get(appt.pacientId);
                  const isFuture = new Date(appt.date).getTime() >= now;
                  return (
                    <tr key={appt._id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {pat?.name || "Paciente removido"}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {doc?.name || "Médico removido"}
                      </td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                        {formatDateTimePtBr(appt.date)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isFuture
                              ? "bg-teal-50 text-teal-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isFuture ? "Agendada" : "Realizada"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!loading && sortedAppointments.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-slate-400"
                    >
                      Nenhuma consulta cadastrada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Últimas prescrições */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Últimas Prescrições
              </h2>
              <p className="text-xs text-slate-500">
                Receitas médicas emitidas no sistema
              </p>
            </div>
            <Link
              href="/prescription/create/upload"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              Gerenciar PDFs →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Medicamento</th>
                  <th className="px-5 py-3 font-semibold">Posologia</th>
                  <th className="px-5 py-3 font-semibold">Data</th>
                  <th className="px-5 py-3 font-semibold">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPrescriptions.slice(0, 5).map((presc) => (
                  <tr key={presc._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {presc.medicine}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {presc.dosage}
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                      {formatDatePtBr(presc.date || presc.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          presc.file
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {presc.file ? "Disponível" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && sortedPrescriptions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-slate-400"
                    >
                      Nenhuma prescrição cadastrada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
