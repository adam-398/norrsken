import * as Location from "expo-location";
import { useEffect, useState } from "react";

export function useWeatherData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<any>(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [kIndex, setKIndex] = useState(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [sunriseData, setSunriseData] = useState<any>(null);

  const today = new Date().toISOString().split("T")[0];

  const offsetMinutes = -new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(offsetMinutes) / 60)
    .toString()
    .padStart(2, "0");
  const mins = (Math.abs(offsetMinutes) % 60).toString().padStart(2, "0");
  const offset = `${offsetMinutes >= 0 ? "+" : "-"}${hours}:${mins}`;

  useEffect(() => {
    const fetchWeatherandLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied");
        setLoading(false);
        return;
      }

      let lat = 66.0;
      let lon = 13.0;

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
          timeInterval: 10000,
          mayShowUserSettingsDialog: true,
        });
        setLocation(location);
        lat = location.coords.latitude;
        lon = location.coords.longitude;

        // Reverse geocode to get city name
        const places = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lon,
        });
        let cityName = places[0].city || "Unknown location";
        setLocationName(cityName);
      } catch (e) {
        console.log("location error details:", JSON.stringify(e));
        console.log("location error message:", e.message);
      }
      // Fetch weather data
      try {
        const response = await fetch(
          `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
          {
            headers: {
              "User-Agent": "norrsken/1.0 adamhodges@live.co.uk",
            },
          },
        );
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.log("weather fetch error:", error);
        setError(String(error));
      } finally {
        setLoading(false);
      }

      // Fetch K-Index data
      try {
        const response = await fetch(
          `https://services.swpc.noaa.gov/json/planetary_k_index_1m.json`,
        );
        const json = await response.json();
        setKIndex(json);
      } catch (error) {
        console.log("k-index fetch error:", error);
      } finally {
        setLoading(false);
      }

      // Fetch sunrise/sunset data
      try {
        const response = await fetch(
          `https://api.met.no/weatherapi/sunrise/3.0/sun?lat=${lat}&lon=${lon}&date=${today}&offset=${offset}`,
          {
            headers: {
              "User-Agent": "norrsken/1.0 adamhodges@live.co.uk",
            },
          },
        );
        const json = await response.json();
        setSunriseData(json);
      } catch (error) {
        console.log("sunrise fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeatherandLocation();
  }, []);

  return {
    data,
    loading,
    error,
    location,
    kIndex,
    locationName,
    sunriseData,
  };
}
