"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "../../../components/AppLayout";
import {
  API_URL,
  apiFetch,
  Appointment,
  Doctor,
  formatDatePtBr,
  getToken,
  Pacient,
  Prescription,
} from "../../../lib/api";

export default function PrescriptionListAndUploadPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pacients, setPacients] = useState<Pacient[]>([]);

  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<Prescription[]>("/prescriptions"),
      apiFetch<Appointment[]>("/appointments"),
      apiFetch<Doctor[]>("/doctors"),
      apiFetch<Pacient[]>("/pacients"),
    ])
      .then(([prescs, appts, docs, pats]) => {
        if (!active) return;
        setPrescriptions(Array.isArray(prescs) ? prescs : []);
        setAppointments(Array.isArray(appts) ? appts : []);
        setDoctors(Array.isArray(docs) ? docs : []);
        setPacients(Array.isArray(pats) ? pats : []);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar prescrições."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const appointmentMap = useMemo(
    () => new Map(appointments.map((a) => [a._id, a])),
    [appointments]
  );
  const doctorMap = useMemo(
    () => new Map(doctors.map((d) => [d._id, d])),
    [doctors]
  );
  const pacientMap = useMemo(
    () => new Map(pacients.map((p) => [p._id, p])),
    [pacients]
  );

  const filteredPrescriptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...prescriptions]
      .sort((a, b) => {
        const da = new Date(a.date || a.createdAt || 0).getTime();
        const db = new Date(b.date || b.createdAt || 0).getTime();
        return db - da;
      })
      .filter((p) => {
        if (!q) return true;
        const appt = appointmentMap.get(p.appointmentId);
        const doc = appt ? doctorMap.get(appt.doctorId) : undefined;
        const pat = appt ? pacientMap.get(appt.pacientId) : undefined;
        return (
          p.medicine.toLowerCase().includes(q) ||
          p.dosage.toLowerCase().includes(q) ||
          (doc?.name || "").toLowerCase().includes(q) ||
          (pat?.name || "").toLowerCase().includes(q)
        );
      });
  }, [prescriptions, search, appointmentMap, doctorMap, pacientMap]);

  const handleGeneratePdf = async (id: string) => {
    setError(null);
    setSuccess(null);
    setBusyId(id);
    try {
      const updated = await apiFetch<Prescription>(
        `/generatePrescriptions/${id}`
      );
      setPrescriptions((prev) =>
        prev.map((item) => (item._id === id ? updated : item))
      );
      setSuccess("PDF da prescrição gerado com sucesso!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao gerar PDF da prescrição."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleUploadPdf = async (id: string) => {
    const file = selectedFiles[id];
    if (!file) {
      setError("Selecione um arquivo antes de fazer upload.");
      return;
    }

    setError(null);
    setSuccess(null);
    setBusyId(id);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const updated = await apiFetch<Prescription>(
        `/uploadPrescription/${id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      setPrescriptions((prev) =>
        prev.map((item) => (item._id === id ? updated : item))
      );
      setSelectedFiles((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setSuccess("Arquivo enviado e vinculado à prescrição!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao enviar arquivo."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDownloadPdf = async (id: string) => {
    setError(null);
    setBusyId(id);
    try {
      const res = await fetch(`${API_URL}/readPrescription/${id}`, {
        method: "GET",
        headers: {
          Authorization: getToken(),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Não foi possível baixar o PDF.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receita-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao baixar o arquivo."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta prescrição?")) return;
    setError(null);
    setSuccess(null);
    try {
      await apiFetch(`/prescriptions/${id}`, { method: "DELETE" });
      setPrescriptions((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao excluir prescrição."
      );
    }
  };

  return (
    <AppLayout
      title="Prescrições Médicas e PDFs"
      subtitle="Emita receitas digitais, gere PDFs automáticos ou faça upload de documentos assinados"
      action={
        <Link
          href="/prescription/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition"
        >
          + Nova Prescrição
        </Link>
      }
    >
      {error && (
        <div className="mb-4 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por medicamento, paciente ou médico..."
            className="w-full sm:max-w-sm px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <span className="text-xs font-medium text-slate-500">
            {filteredPrescriptions.length} prescrição(ões) encontrada(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Data</th>
                <th className="px-5 py-3.5 font-semibold">Paciente / Médico</th>
                <th className="px-5 py-3.5 font-semibold">
                  Medicamento e Posologia
                </th>
                <th className="px-5 py-3.5 font-semibold">Status PDF</th>
                <th className="px-5 py-3.5 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrescriptions.map((presc) => {
                const appt = appointmentMap.get(presc.appointmentId);
                const doc = appt ? doctorMap.get(appt.doctorId) : undefined;
                const pat = appt ? pacientMap.get(appt.pacientId) : undefined;
                const isBusy = busyId === presc._id;

                return (
                  <tr key={presc._id} className="hover:bg-slate-50/70 align-top">
                    <td className="px-5 py-4 whitespace-nowrap text-slate-700 font-medium">
                      {formatDatePtBr(presc.date || presc.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {pat?.name || "Paciente não vinculado"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {doc?.name || "Médico não vinculado"}
                      </p>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-semibold text-slate-900">
                        {presc.medicine}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {presc.dosage}
                      </p>
                      {presc.instructions && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {presc.instructions}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          presc.file
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {presc.file ? "PDF Disponível" : "Sem Arquivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {presc.file ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDownloadPdf(presc._id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-semibold transition cursor-pointer"
                          >
                            {isBusy ? "Baixando..." : "Baixar PDF"}
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleGeneratePdf(presc._id)}
                              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-xs font-semibold transition cursor-pointer"
                            >
                              {isBusy ? "Gerando..." : "Gerar PDF"}
                            </button>

                            <label className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer">
                              {selectedFiles[presc._id]?.name
                                ? selectedFiles[presc._id].name.slice(0, 14) +
                                  "..."
                                : "Escolher arquivo"}
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setSelectedFiles((prev) => ({
                                      ...prev,
                                      [presc._id]: file,
                                    }));
                                  }
                                }}
                              />
                            </label>

                            {selectedFiles[presc._id] && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleUploadPdf(presc._id)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer"
                              >
                                Enviar
                              </button>
                            )}
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(presc._id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition cursor-pointer"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredPrescriptions.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    Nenhuma prescrição encontrada.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    Carregando prescrições...
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
