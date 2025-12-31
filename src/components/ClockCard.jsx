import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View } from "react-native";

const ClockCard = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Time
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  // Date
  const days = [
    "Sunday","Monday","Tuesday","Wednesday",
    "Thursday","Friday","Saturday"
  ];

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const dayName = days[time.getDay()];
  const date = time.getDate();
  const month = months[time.getMonth()];
  const year = time.getFullYear();

  return (
    <View style={styles.card}>
      {/* Time */}
      <Text style={styles.time}>
        {hours}:{minutes}:{seconds}
      </Text>

      {/* Date */}
      <Text style={styles.date}>
        {dayName}, {date} {month} {year}
      </Text>
    </View>
  );
};

export default ClockCard;
const styles = StyleSheet.create({
  card: {
  width: 280,
  height: 150,
  backgroundColor: "#bf9178",
  borderRadius: 20,
  justifyContent: "flex-start",
  alignItems: "center",
  paddingTop: 20,

  shadowColor: "#000",
  shadowOffset: { width: 4, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 8,
}
,
  time: {
    fontSize: 42,
    fontWeight: "700",
    color: "#fff",
  },
  date: {
    marginTop: 8,
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});
