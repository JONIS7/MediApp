"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, getToken, setSession } from "./lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.replace("/home");
    }
  }, [router]);

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!login.trim() || !password.trim()) {
      setError("Informe usuário e senha para acessar o sistema.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: login.trim(), password }),
      });

      const content = await response.json();
      if (response.ok && content.token) {
        setSession(content.token, content.doctor || { name: login, login });
        router.push("/home");
      } else {
        setError(content.error || "Usuário ou senha inválidos.");
      }
    } catch {
      setError(
        "Não foi possível conectar ao servidor da API (verifique se o backend está rodando na porta 3001)."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setLogin("admin");
    setPassword("admin123");
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/80">
        <div className="bg-teal-700 px-8 py-7 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl font-bold">
              +
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">MediApp</h1>
              <p className="text-teal-100 text-sm">
                Sistema Integrado de Gestão Clínica
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAuthentication} className="p-8 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Acesso do Profissional
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Entre com suas credenciais médicas para continuar.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="login"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Usuário
            </label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Ex: admin"
              autoComplete="username"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold shadow-sm transition cursor-pointer"
          >
            {loading ? "Autenticando..." : "Entrar no sistema"}
          </button>

          <div className="pt-2 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-600 space-y-0.5">
                <p className="font-semibold text-slate-800">
                  Credenciais de Demonstração
                </p>
                <p>
                  Usuário: <code className="font-mono font-semibold">admin</code>{" "}
                  • Senha:{" "}
                  <code className="font-mono font-semibold">admin123</code>
                </p>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold border border-teal-200 transition cursor-pointer"
              >
                Preencher Demo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
