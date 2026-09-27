import { useEffect, useState } from "react";
import { describeWeather, fetchForecast } from "../weather";

const dateFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit" });

export default function WeatherPanel({ latitude, longitude, title = "Clima do apiário" }) {
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    setForecast(null);
    setError("");
    fetchForecast(latitude, longitude)
      .then(setForecast)
      .catch((err) => setError(err.message));
  }, [latitude, longitude]);

  if (error) return <div className="panel weather-panel">{error}</div>;
  if (!forecast) return <div className="panel weather-panel">Consultando o Open-Meteo...</div>;

  return (
    <section className="panel weather-panel">
      <div className="weather-head">
        <div>
          <p className="eyebrow">Open-Meteo</p>
          <h3>{title}</h3>
          <p className="muted">{describeWeather(forecast.current.weather_code)}</p>
        </div>
        <div className={`flight-badge score-${Math.floor(forecast.flight.score / 20)}`}>
          <strong>{forecast.flight.score}</strong>
          <span>{forecast.flight.label}</span>
        </div>
      </div>
      <div className="weather-now">
        <p className="temp">{Math.round(forecast.current.temperature_2m)}°C</p>
        <ul>
          <li>Umidade {forecast.current.relative_humidity_2m}%</li>
          <li>Vento {forecast.current.wind_speed_10m} km/h</li>
          <li>Chuva {forecast.current.precipitation} mm</li>
        </ul>
      </div>
      <div className="forecast-row">
        {forecast.daily.map((day) => (
          <article key={day.date}>
            <strong>{dateFmt.format(new Date(`${day.date}T12:00:00`))}</strong>
            <span>
              {Math.round(day.min)}° / {Math.round(day.max)}°
            </span>
            <small>{day.rain} mm</small>
          </article>
        ))}
      </div>
    </section>
  );
}
