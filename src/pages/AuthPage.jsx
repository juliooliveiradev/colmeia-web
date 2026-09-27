import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "apicultor@colmeia.dev",
    password: "colmeia123",
  });

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <section className="auth-hero">
        <span className="hex large" />
        <p className="eyebrow">MVP de componentes e serviços</p>
        <h1>Monitorar um apiário urbano sem perder o ritmo das abelhas.</h1>
        <p>
          A interface consulta o clima no Open-Meteo e persiste colmeias, revisões e colheitas na
          API REST da Colmeia Urbana.
        </p>
      </section>
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Entrar
          </button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            Criar conta
          </button>
        </div>
        {mode === "register" && (
          <label>
            Nome
            <input name="name" value={form.name} onChange={update} required />
          </label>
        )}
        <label>
          E-mail
          <input type="email" name="email" value={form.email} onChange={update} required />
        </label>
        <label>
          Senha
          <input type="password" name="password" value={form.password} onChange={update} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Aguarde..." : mode === "login" ? "Acessar painel" : "Cadastrar"}
        </button>
        <p className="hint">Conta de demonstração: apicultor@colmeia.dev / colmeia123</p>
      </form>
    </div>
  );
}
