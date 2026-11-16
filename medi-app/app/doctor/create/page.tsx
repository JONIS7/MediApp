"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "../../components/AppLayout";
import { apiFetch, formatPhoneInput } from "../../lib/api";

const SPECIALTIES = [
  "Cardiologia",
  "Clínica Geral",
  "Dermatologia",
  "Endocrinologia",
  "Ginecologia",
  "Neurologia",
  "Ortopedia",
  "Pediatria",
  "Psiquiatria",
];

export default function DoctorCreatePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [medicalSpecialty, setMedicalSpecialty] = useState("");
  const [medicalRegistration, setMedicalRegistration] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !name.trim() ||
      !login.trim() ||
      !password.trim() ||
      !medicalSpecialty.trim() ||
      !medicalRegistration.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/postDoctor", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          login: login.trim(),
          password,
          medicalSpecialty: medicalSpecialty.trim(),
          medicalRegistration: medicalRegistration.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });
      router.push("/doctor/create/list");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao cadastrar médico."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout
      title="Cadastrar Médico"
      subtitle="Adicione um novo profissional ao corpo clínico"
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
                placeholder="Ex: Dr. Roberto Almeida"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Usuário de Acesso *
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Ex: roberto.almeida"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Senha *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Especialidade Médica *
              </label>
              <input
                type="text"
                list="specialties-list"
                value={medicalSpecialty}
                onChange={(e) => setMedicalSpecialty(e.target.value)}
                placeholder="Ex: Cardiologia"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <datalist id="specialties-list">
                {SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Registro Médico (CRM) *
              </label>
              <input
                type="text"
                value={medicalRegistration}
                onChange={(e) => setMedicalRegistration(e.target.value)}
                placeholder="Ex: CRM-SP 123456"
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
                placeholder="medico@mediapp.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Telefone (XX 9XXXX-XXXX) *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                placeholder="11 98765-4321"
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
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              {submitting ? "Salvando..." : "Cadastrar Médico"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
