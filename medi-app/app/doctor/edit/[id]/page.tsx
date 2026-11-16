"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "../../../components/AppLayout";
import { apiFetch, Doctor, formatPhoneInput } from "../../../lib/api";

export default function DoctorEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [medicalSpecialty, setMedicalSpecialty] = useState("");
  const [medicalRegistration, setMedicalRegistration] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    apiFetch<Doctor>(`/doctors/${id}`)
      .then((doc) => {
        if (!active) return;
        setName(doc.name || "");
        setLogin(doc.login || "");
        setMedicalSpecialty(doc.medicalSpecialty || "");
        setMedicalRegistration(doc.medicalRegistration || "");
        setEmail(doc.email || "");
        setPhone(doc.phone || "");
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Erro ao carregar médico."
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

    if (
      !name.trim() ||
      !login.trim() ||
      !medicalSpecialty.trim() ||
      !medicalRegistration.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {
        name: name.trim(),
        login: login.trim(),
        medicalSpecialty: medicalSpecialty.trim(),
        medicalRegistration: medicalRegistration.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };
      if (password.trim()) {
        payload.password = password;
      }

      await apiFetch(`/doctors/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      router.push("/doctor/create/list");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar médico."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout
      title="Editar Médico"
      subtitle="Atualize os dados cadastrais do profissional"
      action={
        <Link
          href="/doctor/create/list"
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition"
        >
          ← Voltar à lista
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
            Carregando dados do médico...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Usuário *
                </label>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nova Senha (opcional)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Deixe vazio para manter a atual"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Especialidade Médica *
                </label>
                <input
                  type="text"
                  value={medicalSpecialty}
                  onChange={(e) => setMedicalSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Registro Médico (CRM) *
                </label>
                <input
                  type="text"
                  value={medicalRegistration}
                  onChange={(e) => setMedicalRegistration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                  maxLength={13}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <Link
                href="/doctor/create/list"
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
