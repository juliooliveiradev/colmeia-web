const WEATHER_CODES = {
  0: "Céu limpo",
  1: "Principalmente limpo",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Nevoeiro",
  48: "Nevoeiro depositante",
  51: "Garoa fraca",
  53: "Garoa",
  55: "Garoa forte",
  61: "Chuva fraca",
  63: "Chuva",
  65: "Chuva forte",
  71: "Neve fraca",
  80: "Pancadas fracas",
  81: "Pancadas",
  82: "Pancadas fortes",
  95: "Trovoada",
};

export function describeWeather(code) {
  return WEATHER_CODES[code] || "Condição indefinida";
}

export function beeFlightIndex(current) {
  const temperature = current.temperature_2m;
  const rain = current.precipitation;
  const wind = current.wind_speed_10m;
  let score = 0;
  if (temperature >= 12 && temperature <= 36) score += 40;
  else if (temperature >= 8) score += 20;
  if (rain < 0.2) score += 35;
  else if (rain < 1) score += 15;
  if (wind < 20) score += 25;
  else if (wind < 30) score += 10;

  let label = "Baixo voo";
  if (score >= 80) label = "Voo excelente";
  else if (score >= 55) label = "Voo favorável";
  else if (score >= 35) label = "Voo limitado";

  return { score, label };
}

export async function fetchForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
    timezone: "America/Sao_Paulo",
    forecast_days: "5",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) {
    throw new Error("Não foi possível consultar o Open-Meteo.");
  }
  const data = await response.json();
  return {
    current: data.current,
    daily: data.daily.time.map((day, index) => ({
      date: day,
      code: data.daily.weather_code[index],
      max: data.daily.temperature_2m_max[index],
      min: data.daily.temperature_2m_min[index],
      rain: data.daily.precipitation_sum[index],
    })),
    flight: beeFlightIndex(data.current),
  };
}
