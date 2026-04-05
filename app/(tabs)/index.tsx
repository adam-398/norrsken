import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadingMessage = "Loading weather data...";
  const errorMessage = "Error loading weather data";

  /**
   * Fetch weather data from the API when the component mounts. The API requires a User-Agent header, so we include that in the request. We handle loading, error, and success states accordingly.
   */
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          "https://api.met.no/weatherapi/nowcast/2.0/complete?lat=66.0&lon=20.9",
          {
            headers: {
              "User-Agent": "norrsken/1.0 adamhodges@live.co.uk",
            },
          },
        );
        const json = await response.json();
        setData(json);
      } catch (error) {
        setError(String(error));
      } finally {
        setLoading(false);
      }
    };
    fetchWeatherData();
  }, []);

  if (loading) return <Text style={styles.text}>{loadingMessage}</Text>;
  if (error) return <Text style={styles.text}>{errorMessage}</Text>;
  if (!data) return <Text style={styles.text}>No data available</Text>;

  const current = data.properties.timeseries[0].data.instant.details;
  const temperature = current.air_temperature;
  const precipiration_rate = current.precipitation_rate;
  const relative_humidity = current.relative_humidity;
  const wind_from_direction = current.wind_from_direction;
  const wind_speed = current.wind_speed;
  const wind_speed_of_gust = current.wind_speed_of_gust;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Weather Data:</Text>
      <Text style={styles.text}>Temperature: {temperature}°C</Text>
      <Text style={styles.text}>
        Precipitation Rate: {precipiration_rate} mm/h
      </Text>
      <Text style={styles.text}>Relative Humidity: {relative_humidity}%</Text>
      <Text style={styles.text}>
        Wind From Direction: {wind_from_direction}°
      </Text>
      <Text style={styles.text}>Wind Speed: {wind_speed} m/s</Text>
      <Text style={styles.text}>
        Wind Speed of Gust: {wind_speed_of_gust} m/s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    justifyContent: "center",
    paddingTop: 50,
    paddingLeft: 20,
  },
});
