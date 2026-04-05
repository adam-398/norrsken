import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

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
  const precipiration_rate =
    data.properties.timeseries[0].data.next_1_hours.details
      .precipitation_amount;
  const time = data.properties.timeseries[0].time;
  const date = new Date(time);
  const readableDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
  });
  const readableTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const summary =
    data.properties.timeseries[0].data.next_1_hours.summary.symbol_code;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 10,
        }}
      >
        {data.properties.timeseries.slice(0, 12).map((item, index) => {
          const itemDate = new Date(item.time);
          const itemReadableDate = itemDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
          });
          const itemReadableTime = itemDate.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <View
              key={index}
              style={styles.card}
            >
              <Text style={styles.dateText}>{itemReadableDate}</Text>
              <Text style={styles.timeText}>{itemReadableTime}</Text>
              <Text style={styles.tempText}>
                {item.data.instant.details.air_temperature}°C
              </Text>
              <Text style={styles.precipitationText}>
                {item.data.next_1_hours.details.precipitation_amount} mm/h
              </Text>
              <Text style={styles.summaryText}>
                {item.data.next_1_hours.summary.symbol_code}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "lightgray",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    width: 150,
  },

  text: {
    fontSize: 15,
    fontWeight: "bold",
    paddingTop: 10,
    paddingLeft: 20,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 0,
    textAlign: "center",
  },
  timeText: {
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 10,
    textAlign: "center",
  },
  tempText: {
    fontSize: 25,
    fontWeight: "bold",
    paddingTop: 10,
    textAlign: "center",
  },
  precipitationText: {
    fontSize: 15,
    fontWeight: "bold",
    paddingTop: 10,
    textAlign: "center",
  },
  summaryText: {
    fontSize: 15,
    fontWeight: "bold",
    paddingTop: 10,
    textAlign: "center",
  },
});
