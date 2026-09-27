import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api";
import WeatherPanel from "../components/WeatherPanel";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [firstHive, setFirstHive] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.summary(), api.listHives({ page_size: 1, sort_by: "created_at" })])
      .then(([data, hives]) => {
        setSummary(data);
        setFirstHive(hives.items[0] || null);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!summary) return <p>Carregando painel...</p>;

  const chartData = summary.honey_by_month.map((item) => ({
    name: MONTHS[item.month - 1],
    kg: item.honey_kg,
  }));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Visão do apiário</p>
          <h1>Painel da temporada</h1>
        </div>
        <Link className="button" to="/colmeias">
          Gerenciar colmeias
        </Link>
      </header>

      <section className="kpi-grid">
        <article className="kpi">
          <span>Colmeias</span>
          <strong>{summary.total_hives}</strong>
        </article>
        <article className="kpi">
          <span>Ativas</span>
          <strong>{summary.active_hives}</strong>
        </article>
        <article className="kpi">
          <span>Revisões no mês</span>
          <strong>{summary.inspections_this_month}</strong>
        </article>
        <article className="kpi">
          <span>Mel no ano</span>
          <strong>{summary.honey_this_year_kg.toFixed(1)} kg</strong>
        </article>
      </section>

      <div className="split">
        <section className="panel">
          <h3>Produção de mel (kg)</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8d9b5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="kg" fill="#c4780a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        {firstHive ? (
          <WeatherPanel
            latitude={firstHive.latitude}
            longitude={firstHive.longitude}
            title={`Clima em ${firstHive.neighborhood || firstHive.name}`}
          />
        ) : (
          <section className="panel">Cadastre uma colmeia para ver o clima do ponto.</section>
        )}
      </div>

      <section className="panel">
        <h3>Distribuição e revisões recentes</h3>
        <div className="status-pills">
          {Object.entries(summary.status_distribution).map(([status, count]) => (
            <span key={status} className={`pill ${status}`}>
              {status}: {count}
            </span>
          ))}
        </div>
        <ul className="timeline">
          {summary.recent_inspections.map((item) => (
            <li key={item.id}>
              <strong>Revisão #{item.id}</strong>
              <span>{item.inspected_at}</span>
              <em>saúde {item.health_score}/6</em>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
