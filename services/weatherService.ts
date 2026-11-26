import type { WeatherInfo } from '@/types';

const WEATHER_CODE_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Light rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Moderate showers',
  95: 'Thunderstorm',
};

export function describeWeatherCode(code?: number): string {
  if (code === undefined) return 'Unavailable';
  return WEATHER_CODE_LABELS[code] ?? 'Local conditions';
}

export async function fetchLocalWeather(): Promise<WeatherInfo> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return {
      status: 'unavailable',
      errorMessage: 'Geolocation not supported in this browser.',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(
            4
          )}&longitude=${longitude.toFixed(
            4
          )}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;

          const res = await fetch(url);
          if (!res.ok) {
            resolve({
              status: 'unavailable',
              errorMessage: 'Weather service temporarily unreachable.',
            });
            return;
          }
          const data = await res.json();
          const currentTemp = data?.current?.temperature_2m;
          const code = data?.current?.weather_code;
          const high = data?.daily?.temperature_2m_max?.[0];
          const low = data?.daily?.temperature_2m_min?.[0];

          if (typeof currentTemp !== 'number') {
            resolve({ status: 'unavailable' });
            return;
          }

          resolve({
            status: 'ready',
            temperatureC: Math.round(currentTemp),
            code,
            condition: describeWeatherCode(code),
            highC: typeof high === 'number' ? Math.round(high) : undefined,
            lowC: typeof low === 'number' ? Math.round(low) : undefined,
          });
        } catch {
          resolve({
            status: 'unavailable',
            errorMessage: 'Could not reach weather service.',
          });
        }
      },
      () => {
        resolve({
          status: 'denied',
          errorMessage: 'Location permission declined.',
        });
      },
      { timeout: 8000, maximumAge: 600000 }
    );
  });
}
