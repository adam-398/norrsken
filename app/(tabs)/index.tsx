import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  const loadingMessage = "Loading weather data...";
  const errorMessage = "Error loading weather data";

  useEffect(() => {
    /**
     * Fetch weather data from the API when the component mounts.
     *  The API requires a User-Agent header, so we include that in the request.
     *  We handle loading, error, and success states accordingly.
     */
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
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        lat = location.coords.latitude;
        lon = location.coords.longitude;
      } catch (e) {
        console.log("location error, using backup coordinates:");
      }

      try {
        const response = await fetch(
          `https://api.met.no/weatherapi/nowcast/2.0/complete?lat=${lat}&lon=${lon}`,
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
    };

    fetchWeatherandLocation();
  }, []);

  if (loading) return <Text style={styles.text}>{loadingMessage}</Text>;
  if (error) return <Text style={styles.text}>{errorMessage}</Text>;
  if (!data) return <Text style={styles.text}>No data available</Text>;

  /**
   * Extract the relevant weather data from the API response.
   *  The API returns a timeseries array, and we take the first entry to get the current weather conditions.
   *  We then extract specific details such as temperature, precipitation rate, humidity, wind direction, and wind speed to display in the UI.
   */
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
