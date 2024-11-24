import { View, Text } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context"
import React from 'react'
import { images } from "../../constants"
import "../global.css"

const Products = () => {
  return (
    <SafeAreaView className="bg-primary">
      {/* <View className="mt-1.5">
          <Image
            source={images.bazaar_logo}
            className="w-9 h-10"
            resizeMode="contain"
          />
      </View> */}
    </SafeAreaView>
  )
}

export default Products