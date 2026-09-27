import { useState } from "react";
import LocationPicker from "./LocationPicker";

const empty = {
  name: "",
  species: "Apis mellifera",
  neighborhood: "",
  latitude: -23.5505,
  longitude: -46.6333,
  status: "ativa",
  installed_at: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function HiveForm({ initialValue, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initialValue || empty);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "latitude" || name === "longitude" ? Number(value) : value,
    }));
  }

  function selectLocation({ latitude, longitude, neighborhood }) {
    setForm((current) => ({
      ...current,
      latitude,
      longitude,
      neighborhood: current.neighborhood || neighborhood || "",
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        Nome da colmeia
        <input name="name" value={form.name} onChange={update} required />
      </label>
      <label>
        Espécie
        <input name="species" value={form.species} onChange={update} required />
      </label>
      <label>
        Bairro / parque
        <input name="neighborhood" value={form.neighborhood} onChange={update} />
      </label>
      <label>
        Situação
        <select name="status" value={form.status} onChange={update}>
          <option value="ativa">Ativa</option>
          <option value="enxameacao">Em enxameação</option>
          <option value="inativa">Inativa</option>
        </select>
      </label>
      <div className="full">
        <p className="eyebrow">Localização no mapa</p>
        <LocationPicker latitude={form.latitude} longitude={form.longitude} onSelect={selectLocation} />
      </div>
      <label>
        Instalada em
        <input type="date" name="installed_at" value={form.installed_at} onChange={update} required />
      </label>
      <label className="full">
        Observações
        <textarea name="notes" rows="3" value={form.notes} onChange={update} />
      </label>
      <div className="form-actions full">
        <button type="button" className="ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar colmeia"}
        </button>
      </div>
    </form>
  );
}
