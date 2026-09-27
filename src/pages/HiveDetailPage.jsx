import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import HiveForm from "../components/HiveForm";
import WeatherPanel from "../components/WeatherPanel";

const emptyInspection = {
  inspected_at: new Date().toISOString().slice(0, 10),
  queen_seen: true,
  brood_pattern: "regular",
  pest_signs: false,
  temperament: "calmo",
  notes: "",
};

const emptyHarvest = {
  harvested_at: new Date().toISOString().slice(0, 10),
  honey_kg: 1,
  wax_g: 0,
  notes: "",
};

export default function HiveDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hive, setHive] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [editing, setEditing] = useState(false);
  const [inspection, setInspection] = useState(emptyInspection);
  const [editingInspectionId, setEditingInspectionId] = useState(null);
  const [harvest, setHarvest] = useState(emptyHarvest);
  const [error, setError] = useState("");

  async function load() {
    const [hiveData, inspectionData, harvestData] = await Promise.all([
      api.getHive(id),
      api.listInspections(id),
      api.listHarvests(id),
    ]);
    setHive(hiveData);
    setInspections(inspectionData);
    setHarvests(harvestData);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [id]);

  async function saveHive(payload) {
    await api.updateHive(id, payload);
    setEditing(false);
    await load();
  }

  async function saveInspection(event) {
    event.preventDefault();
    if (editingInspectionId) {
      await api.updateInspection(editingInspectionId, inspection);
      setEditingInspectionId(null);
    } else {
      await api.createInspection({ ...inspection, hive_id: Number(id) });
    }
    setInspection(emptyInspection);
    await load();
  }

  function startEditInspection(item) {
    setEditingInspectionId(item.id);
    setInspection({
      inspected_at: item.inspected_at,
      queen_seen: item.queen_seen,
      brood_pattern: item.brood_pattern,
      pest_signs: item.pest_signs,
      temperament: item.temperament,
      notes: item.notes,
    });
  }

  function cancelEditInspection() {
    setEditingInspectionId(null);
    setInspection(emptyInspection);
  }

  async function addHarvest(event) {
    event.preventDefault();
    await api.createHarvest({ ...harvest, hive_id: Number(id), honey_kg: Number(harvest.honey_kg), wax_g: Number(harvest.wax_g) });
    setHarvest(emptyHarvest);
    await load();
  }

  if (error) return <p className="error">{error}</p>;
  if (!hive) return <p>Carregando ficha...</p>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/colmeias" className="muted">
            Voltar às colmeias
          </Link>
          <h1>{hive.name}</h1>
          <p className="muted">
            {hive.species} · {hive.neighborhood} · instalada em {hive.installed_at}
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="ghost" onClick={() => setEditing((value) => !value)}>
            {editing ? "Fechar edição" : "Editar"}
          </button>
          <button
            type="button"
            className="danger-solid"
            onClick={async () => {
              if (!window.confirm("Excluir esta colmeia?")) return;
              await api.deleteHive(id);
              navigate("/colmeias");
            }}
          >
            Excluir
          </button>
        </div>
      </header>

      {editing && (
        <section className="panel">
          <h3>Atualizar colmeia</h3>
          <HiveForm initialValue={hive} onSubmit={saveHive} onCancel={() => setEditing(false)} />
        </section>
      )}

      <WeatherPanel latitude={hive.latitude} longitude={hive.longitude} title={`Condição em ${hive.name}`} />

      <div className="split">
        <section className="panel">
          <h3>{editingInspectionId ? "Editar revisão" : "Nova revisão"}</h3>
          <form className="stack" onSubmit={saveInspection}>
            <input
              type="date"
              value={inspection.inspected_at}
              onChange={(event) => setInspection((current) => ({ ...current, inspected_at: event.target.value }))}
            />
            <select
              value={inspection.brood_pattern}
              onChange={(event) => setInspection((current) => ({ ...current, brood_pattern: event.target.value }))}
            >
              <option value="forte">Cria forte</option>
              <option value="regular">Cria regular</option>
              <option value="fraco">Cria fraca</option>
            </select>
            <select
              value={inspection.temperament}
              onChange={(event) => setInspection((current) => ({ ...current, temperament: event.target.value }))}
            >
              <option value="calmo">Temperamento calmo</option>
              <option value="alerta">Temperamento alerta</option>
              <option value="defensivo">Temperamento defensivo</option>
            </select>
            <label className="check">
              <input
                type="checkbox"
                checked={inspection.queen_seen}
                onChange={(event) => setInspection((current) => ({ ...current, queen_seen: event.target.checked }))}
              />
              Rainha vista
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={inspection.pest_signs}
                onChange={(event) => setInspection((current) => ({ ...current, pest_signs: event.target.checked }))}
              />
              Sinais de praga
            </label>
            <textarea
              placeholder="Notas de campo"
              value={inspection.notes}
              onChange={(event) => setInspection((current) => ({ ...current, notes: event.target.value }))}
            />
            <div className="form-actions">
              {editingInspectionId && (
                <button type="button" className="ghost" onClick={cancelEditInspection}>
                  Cancelar
                </button>
              )}
              <button type="submit">{editingInspectionId ? "Salvar revisão" : "Registrar revisão"}</button>
            </div>
          </form>
          <ul className="record-list">
            {inspections.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.inspected_at}</strong>
                  <p>
                    Saúde {item.health_score}/6 · {item.brood_pattern} · {item.temperament}
                  </p>
                </div>
                <div className="record-actions">
                  <button type="button" className="link-button" onClick={() => startEditInspection(item)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="link-button danger"
                    onClick={() => api.deleteInspection(item.id).then(() => {
                      if (editingInspectionId === item.id) cancelEditInspection();
                      return load();
                    })}
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h3>Nova colheita</h3>
          <form className="stack" onSubmit={addHarvest}>
            <input
              type="date"
              value={harvest.harvested_at}
              onChange={(event) => setHarvest((current) => ({ ...current, harvested_at: event.target.value }))}
            />
            <input
              type="number"
              min="0"
              step="0.1"
              value={harvest.honey_kg}
              onChange={(event) => setHarvest((current) => ({ ...current, honey_kg: event.target.value }))}
              placeholder="Mel (kg)"
            />
            <input
              type="number"
              min="0"
              step="1"
              value={harvest.wax_g}
              onChange={(event) => setHarvest((current) => ({ ...current, wax_g: event.target.value }))}
              placeholder="Cera (g)"
            />
            <textarea
              placeholder="Notas da extração"
              value={harvest.notes}
              onChange={(event) => setHarvest((current) => ({ ...current, notes: event.target.value }))}
            />
            <button type="submit">Registrar colheita</button>
          </form>
          <ul className="record-list">
            {harvests.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.harvested_at}</strong>
                  <p>
                    {item.honey_kg} kg de mel · {item.wax_g} g de cera
                  </p>
                </div>
                <button type="button" className="link-button danger" onClick={() => api.deleteHarvest(item.id).then(load)}>
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
