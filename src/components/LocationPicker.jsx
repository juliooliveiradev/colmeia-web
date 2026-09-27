import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [-23.5505, -46.6333];

const selectedIcon = L.divIcon({
  className: "map-pin confirmed",
  html: "<span></span>",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function Recenter({ lat, lng, active }) {
  const map = useMap();
  useEffect(() => {
    if (!active || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
    map.invalidateSize();
    map.setView([lat, lng], 16);
  }, [active, lat, lng, map]);
  return null;
}

function AutoLocate({ onLocated }) {
  const map = useMap();
  const started = useRef(false);
  const onLocatedRef = useRef(onLocated);
  onLocatedRef.current = onLocated;

  useEffect(() => {
    if (started.current) return undefined;
    started.current = true;

    function goTo(lat, lng) {
      map.invalidateSize();
      map.setView([lat, lng], 16);
      onLocatedRef.current(lat, lng);
    }

    function onFound(event) {
      goTo(event.latlng.lat, event.latlng.lng);
    }

    function onError() {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (position) => goTo(position.coords.latitude, position.coords.longitude),
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    function startLocate() {
      map.invalidateSize();
      map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
    }

    map.on("locationfound", onFound);
    map.on("locationerror", onError);
    const first = setTimeout(startLocate, 80);
    const second = setTimeout(() => map.invalidateSize(), 280);

    return () => {
      clearTimeout(first);
      clearTimeout(second);
      map.off("locationfound", onFound);
      map.off("locationerror", onError);
      map.stopLocate();
    };
  }, [map]);

  return null;
}

function ClickCatcher({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

async function searchPlaces(query) {
  const params = new URLSearchParams({
    format: "jsonv2",
    q: query,
    limit: "5",
    addressdetails: "1",
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Não foi possível buscar o local.");
  return response.json();
}

async function reverseGeocode(latitude, longitude) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    addressdetails: "1",
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return "";
  const data = await response.json();
  return (
    data.address?.suburb ||
    data.address?.neighbourhood ||
    data.address?.city_district ||
    data.address?.quarter ||
    data.address?.city ||
    data.display_name ||
    ""
  );
}

export default function LocationPicker({ latitude, longitude, onSelect }) {
  const selected = [Number(latitude), Number(longitude)];
  const hasSelected = Number.isFinite(selected[0]) && Number.isFinite(selected[1]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("Buscando sua localização atual...");
  const [searching, setSearching] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [followPoint, setFollowPoint] = useState(false);
  const locatedOnce = useRef(false);

  const view = hasSelected ? selected : DEFAULT_CENTER;

  useEffect(() => {
    setMapReady(true);
    return () => setMapReady(false);
  }, []);

  async function pick(lat, lng, label = "") {
    const latitudeValue = Number(lat.toFixed(6));
    const longitudeValue = Number(lng.toFixed(6));
    const neighborhood = await reverseGeocode(latitudeValue, longitudeValue);
    onSelect({
      latitude: latitudeValue,
      longitude: longitudeValue,
      neighborhood,
    });
    setFollowPoint(true);
    setResults([]);
    setMessage(label ? `Ponto selecionado: ${label}` : "Ponto selecionado. Ele será salvo com a colmeia.");
  }

  function handleAutoLocated(lat, lng) {
    if (locatedOnce.current) return;
    locatedOnce.current = true;
    pick(lat, lng, "sua localização atual");
  }

  async function handleSearch(event) {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setMessage("");
    try {
      const found = await searchPlaces(query.trim());
      setResults(found);
      if (!found.length) setMessage("Nenhum local encontrado.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="location-picker">
      <div className="search-row">
        <input
          type="search"
          placeholder="Pesquisar rua, parque ou bairro"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSearch(event);
            }
          }}
        />
        <button type="button" className="ghost" onClick={handleSearch} disabled={searching}>
          {searching ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {results.length > 0 && (
        <ul className="search-results">
          {results.map((place) => (
            <li key={place.place_id}>
              <button
                type="button"
                className="link-button"
                onClick={() => pick(Number(place.lat), Number(place.lon), place.display_name)}
              >
                {place.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="location-map">
        {mapReady && (
          <MapContainer center={view} zoom={14} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <AutoLocate onLocated={handleAutoLocated} />
            <Recenter lat={view[0]} lng={view[1]} active={followPoint} />
            <ClickCatcher onPick={(lat, lng) => pick(lat, lng)} />
            {hasSelected && <Marker position={selected} icon={selectedIcon} />}
          </MapContainer>
        )}
      </div>

      <p className="muted">O mapa abre na sua localização atual. Clique ou busque outro local para alterar o ponto salvo.</p>
      {message && <p className="hint">{message}</p>}
    </div>
  );
}
