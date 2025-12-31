import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from '../screens/HomeScreen';
import Progress from '../screens/Progress';
import Task from '../screens/Task';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SplashAuth from '../screens/SplashAuth';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Splash */}
        <Stack.Screen name="Splash" component={SplashAuth} />

        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />

        {/* App */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Task" component={Task} />
        <Stack.Screen name="Progress" component={Progress} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
