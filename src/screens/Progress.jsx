import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

import landing1 from '../assests/LandingPage.png';

const Progress = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    database()
      .ref(`/tasks/${user.uid}`)
      .on('value', snapshot => {
        const data = snapshot.val() || {};
        calculateProgress(Object.values(data));
      });
  }, []);

  const calculateProgress = tasks => {
    const dayMap = {};

    tasks.forEach(task => {
      const date = new Date(task.createdAt)
        .toISOString()
        .split('T')[0];

      if (!dayMap[date]) {
        dayMap[date] = { total: 0, completed: 0 };
      }

      dayMap[date].total += 1;
      if (task.completed) dayMap[date].completed += 1;
    });

    const marks = {};
    Object.keys(dayMap).forEach(date => {
      const day = dayMap[date];

      if (day.completed === day.total) {
        marks[date] = { selected: true, selectedColor: '#2f9e44' }; // GREEN
      } else {
        marks[date] = { selected: true, selectedColor: '#c92a2a' }; // RED
      }
    });

    setMarkedDates(marks);
    calculateStreak(marks);
  };

  const calculateStreak = marks => {
    let count = 0;
    let date = new Date();

    while (true) {
      const key = date.toISOString().split('T')[0];
      if (marks[key]?.selectedColor === '#2f9e44') {
        count++;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(count);
  };

  return (
    <ImageBackground source={landing1} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>📈 Progress</Text>

        <Text style={styles.streak}>🔥 Current Streak: {streak} days</Text>

        <Calendar
          markingType="simple"
          markedDates={markedDates}
          theme={{
            calendarBackground: '#bf9178',
            dayTextColor: '#fff',
            monthTextColor: '#fff',
            arrowColor: '#fff',
            todayTextColor: '#ffd43b',
          }}
        />

        <View style={styles.legend}>
          <Text style={{ color: '#2f9e44' }}>🟢 Completed</Text>
          <Text style={{ color: '#c92a2a' }}>🔴 Skipped</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Progress;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 90,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#bf9178',
    width: '90%',
    padding: 20,
    borderRadius: 18,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  streak: {
    color: '#ffd43b',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 10,
  },
  legend: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
