import { StyleSheet, Text, View } from 'react-native'
import { SplashScreen, Stack } from 'expo-router'
import React, { useEffect } from 'react'
import { useFonts } from 'expo-font'
import "./global.css"

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "Afacad-Bold": require("../assets/fonts/Afacad-Bold.ttf"),
    "Afacad-BoldItalic": require("../assets/fonts/Afacad-BoldItalic.ttf"),
    "Afacad-Medium": require("../assets/fonts/Afacad-Medium.ttf"),
    "Afacad-MediumItalic": require("../assets/fonts/Afacad-MediumItalic.ttf"),
    "Afacad-SemiBold": require("../assets/fonts/Afacad-SemiBold.ttf"),
    "Afacad-Regular": require("../assets/fonts/Afacad-Regular.ttf"),
    "Afacad-SemiBold": require("../assets/fonts/Afacad-SemiBold.ttf"),
    "Afacad-SemiBoldItalic": require("../assets/fonts/Afacad-SemiBoldItalic.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return null;
  }

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown:
        false }}></Stack.Screen>
    </Stack>
  )
}

export default RootLayout