import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import HiveForm from "../components/HiveForm";

export default function HivesPage() {
  const [data, setData] = useState({ items: [], total: 0, page: 1 });
  const [filters, setFilters] = useState({ q: "", status: "", sort_by: "created_at", sort_dir: "desc" });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(page = 1) {
    const result = await api.listHives({ ...filters, page, page_size: 9 });
    setData(result);
  }

  useEffect(() => {
    load(1).catch((err) => setError(err.message));
  }, [filters]);

  async function createHive(payload) {
    setLoading(true);
    setError("");
    try {
      await api.createHive(payload);
      setOpen(false);
      await load(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function removeHive(id) {
    if (!window.confirm("Excluir esta colmeia e todo o histórico?")) return;
    await api.deleteHive(id);
    await load(data.page);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">GET, POST e DELETE</p>
          <h1>Colmeias do apiário</h1>
        </div>
        <button type="button" onClick={() => setOpen(true)}>
          Nova colmeia
        </button>
      </header>

      <section className="filters">
        <input
          placeholder="Buscar por nome, bairro ou espécie"
          value={filters.q}
          onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
        />
        <select
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
        >
          <option value="">Todas as situações</option>
          <option value="ativa">Ativas</option>
          <option value="enxameacao">Em enxameação</option>
          <option value="inativa">Inativas</option>
        </select>
        <select
          value={`${filters.sort_by}:${filters.sort_dir}`}
          onChange={(event) => {
            const [sort_by, sort_dir] = event.target.value.split(":");
            setFilters((current) => ({ ...current, sort_by, sort_dir }));
          }}
        >
          <option value="created_at:desc">Mais recentes</option>
          <option value="name:asc">Nome A-Z</option>
          <option value="installed_at:desc">Instalação recente</option>
        </select>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="card-grid">
        {data.items.map((hive) => (
          <article key={hive.id} className="hive-card">
            <div className="card-top">
              <span className={`pill ${hive.status}`}>{hive.status}</span>
              <button type="button" className="link-button danger" onClick={() => removeHive(hive.id)}>
                Excluir
              </button>
            </div>
            <h3>{hive.name}</h3>
            <p>{hive.species}</p>
            <p className="muted">{hive.neighborhood || "Sem bairro informado"}</p>
            <Link to={`/colmeias/${hive.id}`}>Abrir ficha e clima</Link>
          </article>
        ))}
      </section>

      {data.total > data.page_size && (
        <div className="pager">
          <button type="button" disabled={data.page <= 1} onClick={() => load(data.page - 1)}>
            Anterior
          </button>
          <span>
            Página {data.page} de {Math.ceil(data.total / data.page_size)}
          </span>
          <button
            type="button"
            disabled={data.page >= Math.ceil(data.total / data.page_size)}
            onClick={() => load(data.page + 1)}
          >
            Próxima
          </button>
        </div>
      )}

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h2>Cadastrar colmeia</h2>
            <HiveForm onSubmit={createHive} onCancel={() => setOpen(false)} loading={loading} />
          </div>
        </div>
      )}
    </div>
  );
}
