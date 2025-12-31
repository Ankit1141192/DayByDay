import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import landing1 from '../assests/LandingPage.png';

import { auth, firestore } from '../firebase/firebase';

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const registerUser = async () => {
    try {
      const user = await auth().createUserWithEmailAndPassword(
        email,
        password
      );

      await firestore()
        .collection('users')
        .doc(user.user.uid)
        .set({
          email,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Signup Error', error.message);
    }
  };

  return (
    <ImageBackground source={landing1} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#ccc"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.btn} onPress={registerUser}>
          <Text style={styles.btnText}>Create Account</Text>
        </TouchableOpacity>

        <Text style={styles.link} onPress={() => navigation.goBack()}>
          Already have an account? Login
        </Text>
      </View>
    </ImageBackground>
  );
};

export default SignupScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#bf9178',
    padding: 25,
    borderRadius: 18,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    color: '#fff',
  },
  btn: {
    backgroundColor: '#4E6CFF',
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  link: {
    color: '#fff',
    marginTop: 15,
    textAlign: 'center',
  },
});
