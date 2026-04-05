import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { auroraMessage } from "../utils/auroraMessage";

export default function HomeScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [kIndex, setKIndex] = useState(null);

  const loadingMessage = "Loading weather data...";
  const errorMessage = "Error loading weather data";

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
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        lat = location.coords.latitude;
        lon = location.coords.longitude;
      } catch (e) {
        console.log("location error, using backup coordinates:", e);
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
    };
    fetchWeatherandLocation();
  }, []);

  if (loading) return <Text style={styles.text}>{loadingMessage}</Text>;
  if (error) return <Text style={styles.text}>{errorMessage}</Text>;
  if (!data) return <Text style={styles.text}>No data available</Text>;

  if (!kIndex)
    return <Text style={styles.text}>No K-Index data available</Text>;

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

  const kPIndex = kIndex[kIndex.length - 1].kp_index;
  const auroraForecast = auroraMessage(kPIndex);

  return (
    <LinearGradient
      colors={[
        "#05080f",
        "#070c1a",
        "#0a0f2a",
        "#0c1540",
        "#0d1a4a",
        "#122260",
        "#1a2d6e",
        "#223880",
        "#2a4d8a",
        "#335a98",
        "#3d6aaa",
        "#4d7ab8",
        "#5a8abf",
        "#6a97c8",
        "#7aaad4",
        "#8abade",
        "#a0c4e8",
        "#b8d4f0",
        "#c8dff0",
        "#d8e8f0",
        "#e8c99a",
        "#f0a060",
      ]}
      style={styles.container}
    >
      <Text style={styles.kTextFirst}>Aurora forecast: K-Index {kPIndex}</Text>
      <Text style={styles.kTextSecond}>{auroraForecast}</Text>
      <View style={styles.bottomBar}>
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
            const iconUrl = `https://raw.githubusercontent.com/metno/weathericons/main/weather/png/${item.data.next_1_hours.summary.symbol_code}.png`;
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
                <Image
                  source={{ uri: iconUrl }}
                  style={{ width: 75, height: 75, marginTop: 10 }}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#1a1a2e",
  },
  bottomBar: {
    position: "absolute",
    bottom: 40,
  },
  card: {
    backgroundColor: "#1a2f4a",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    width: 150,
  },

  text: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    paddingTop: 10,
    paddingLeft: 20,
  },
  kTextFirst: {
    color: "white",
    fontSize: 23,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 100,
    padding: 1,
  },
  kTextSecond: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 10,
    padding: 1,
  },
  dateText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 0,
    textAlign: "center",
  },
  timeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 10,
    textAlign: "center",
  },
  tempText: {
    color: "white",
    fontSize: 35,
    fontWeight: "bold",
    paddingTop: 10,
    textAlign: "center",
  },
  precipitationText: {
    color: "white",
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
