import { View, Text, ScrollView, Image } from 'react-native'
import React from 'react'
import { Link, router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context'

import { images } from "../../constants";

const Sign_in = () => {
  return (
    <SafeAreaView className="h-full" style={{
      backgroundColor: "#97886b"
    }}>
      <ScrollView>
        <View
          className="w-full flex justify-center h-full px-4 my-6"
          style={{
          }}
        >
          <Image
            source={images.bazaar_logo}
            style={{
              resizeMode: "contain",
              width: 250,
              height: 250,
            }}
          />
          

          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Log in to Aora
          </Text>


          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-zinc-200 font-pregular">
              Don't have an account?
            </Text>
            <Link
              href="/sign_up"
              className="text-lg font-psemibold text-secondary"
            >
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Sign_in