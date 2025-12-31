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
import { GoogleSignin } from '../firebase/googleAuth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // EMAIL LOGIN
  const loginUser = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  // GOOGLE LOGIN ✅
  const googleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const { idToken } = await GoogleSignin.signIn();

      const googleCredential =
        auth.GoogleAuthProvider.credential(idToken);

      const userCredential =
        await auth().signInWithCredential(googleCredential);

      await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .set(
          {
            name: userCredential.user.displayName,
            email: userCredential.user.email,
            createdAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

      navigation.replace('Home');
    } catch (error) {
      console.log('Google Error:', error);
      Alert.alert('Google Login Error', error.message);
    }
  };

  return (
    <ImageBackground source={landing1} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

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

        <TouchableOpacity style={styles.btn} onPress={loginUser}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.googleBtn]}
          onPress={googleLogin}
        >
          <Text style={styles.btnText}>Login with Google</Text>
        </TouchableOpacity>

        <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
          Don't have an account? Sign Up
        </Text>
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;

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
  googleBtn: {
    backgroundColor: '#DB4437',
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
