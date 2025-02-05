import { StyleSheet, Text, View, Image, KeyboardAvoidingView, TextInput, TouchableOpacity, Platform, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { hp, wp } from '@/helpers/common'
import CustomButton from '@/components/Button'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase'
import { StatusBar } from "expo-status-bar"

// sign in functions
const SignIn = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // State for inputs
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // State for errors
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
  // loading st
  const [isLoading, setIsLoading] = useState(false);


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const validateInputs = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Confirm password is required');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  }
  

  const signIn = async () => {
    if (!validateInputs()) {
      return;  
    }
  
    setIsLoading(true); 
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
  
      if (authError) {
        throw authError;
      }
  
     
      if (authData.session) {
        await SecureStore.setItemAsync('token', authData.session.access_token);
        router.replace('/(auth)/(tabs)/homepage'); 
      }
    } catch (error) {
      console.error('Error signing in:', error);
      if (error instanceof Error) {
        Alert.alert(error.message);  
      } else {
        Alert.alert('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <StatusBar style="dark"/>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.container}
        >
          <View style={styles.innerContainer}>
            <Image 
              style={styles.logo} 
              source={require('@/assets/images/mojoGram.png')} 
            />
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Log in to continue :)</Text>

            <View>
              <TextInput 
                style={[
                  styles.textField, 
                  emailError ? styles.errorInput : {}
                ]}
                placeholder='Email'
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>
            
            <View>
              <View style={styles.passwordContainer}>
                <TextInput 
                  style={[
                    styles.textFieldPassword, 
                    passwordError ? styles.errorInput : {}
                  ]}
                  placeholder='Password'
                  placeholderTextColor="#888"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={togglePasswordVisibility}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#888" 
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            <View>
              <View style={styles.passwordContainer}>
                <TextInput 
                  style={[
                    styles.textFieldPassword, 
                    confirmPasswordError ? styles.errorInput : {}
                  ]}
                  placeholder='Confirm Password'
                  placeholderTextColor="#888"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={toggleConfirmPasswordVisibility}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#888" 
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPassword}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
            <CustomButton 
                title="Log in" 
                onPress={signIn}
                backgroundColor="#3A3B3C"
                width={wp(70)}
                height={hp(6)}
                fontFamily="Poppins-Bold"
                fontSize={18}
                isLoading={isLoading}
                loadingColor="#FFFFFF"
              />
            </View>

            <View style={styles.signUpContainer}>
              <Text style={styles.accountText}>
                Don't have an account? 
              </Text>
              <TouchableOpacity onPress={() => router.push('/SignUp')}>
                <Text style={styles.signUpText}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </ScreenWrapper>
  )
}

export default SignIn


const styles = StyleSheet.create({
  errorInput: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 10,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(80),
    marginVertical: hp(1),
  },
  textField: {
    width: wp(80),
    height: hp(6),
    backgroundColor: '#F4F4F4',
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 14,
    marginVertical: hp(1),
    shadowColor: '#000',
  },
  textFieldPassword: {
    flex: 1,
    height: hp(6),
    backgroundColor: '#F4F4F4',
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 14,
    shadowColor: '#000',
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    padding: 10,
  },
  logo: {
    width: wp(90),
    height: hp(20),
    resizeMode: 'cover',
    alignSelf: 'center',
  },
  title: {
    fontSize: hp(3),
    fontFamily: 'Poppins-Bold',
    alignSelf: 'center',
    marginTop: hp(2),
  },
  subtitle: {
    fontSize: hp(2),
    fontFamily: 'Poppins-Medium',
    color: 'gray',
    alignSelf: 'center',
    marginBottom: hp(2),
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginRight: wp(10),
    marginVertical: hp(1),
  },
  forgotPassword: {
    color: '#0000FF',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: hp(2),
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
  },
  accountText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  signUpText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#0000FF',
    marginLeft: wp(2),
  },
});




