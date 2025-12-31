import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

import landing1 from '../assests/LandingPage.png';

import ClockCard from '../components/ClockCard';
import TaskGrid from '../components/TaskGrid';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={landing1}
      style={styles.container}
      resizeMode="cover"
    >
      <ClockCard />

      <Text style={styles.text}>Set Your Reminder for Today</Text>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Task')}
        >
          <Text style={styles.buttonText}>Create Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonProgress}
          onPress={() => navigation.navigate('Progress')}
        >
          <Text style={styles.buttonText}>Check Progress</Text>
        </TouchableOpacity>
      </View>

      <TaskGrid/>
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 70,
  },

  text: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
  },

  buttonWrapper: {
  marginTop: 30,
  width: '90%',
  gap:10,
  flexDirection: 'row', 
  justifyContent: 'space-between',
},


  button: {
    backgroundColor: '#69af80ff',
    paddingVertical: 17,
    paddingHorizontal:20,
    borderRadius: 16,
    marginTop: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonProgress:{
    backgroundColor: '#451667ff',
    paddingVertical: 17,
    paddingHorizontal:20,
    borderRadius: 16,
    marginTop: 12,
    alignItems: 'center',
  }
});
