import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { auth } from '../firebase/firebase';

const SplashAuth = ({ navigation }) => {
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        navigation.replace('Home');
      } else {
        navigation.replace('Login');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default SplashAuth;
