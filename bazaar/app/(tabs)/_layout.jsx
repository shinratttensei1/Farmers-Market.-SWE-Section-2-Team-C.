import { View, Text, Image, ImageSourcePropType } from 'react-native'
import { Tabs, Redirect } from 'expo-router'
import "../global.css"

import { icons } from '../../constants'

const TabIcon = ({ icon, color, name, focused }) => {
    return (
        <View className='items-center justify-bottom gap-2 text-center'>
          <Image
          source={icon}
          tintColor={color}
          style={{
            resizeMode: 'center',
            width: 30,
            height: 30,
          }}
          />
            <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs text-zinc`}>
              {name}
            </Text>
        </View>
    )
}

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#ffefca",
          tabBarInactiveTintColor: "#14120e",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#4e4637",
            borderTopWidth: 1,
            borderTopColor: "#232533",
            height: 84,
        },
      }}
      >
        <Tabs.Screen
          name="products"
          options={{
            title: 'Products',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                  icon={icons.crops}
                  color={color}
                  name="Products"
                  focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen
          name="sell"
          options={{
            title: 'Sell',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                  icon={icons.plus}
                  color={color}
                  name="Sell"
                  focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
                icon={icons.cart}
                color={color}
                name="Cart"
                focused={focused}
            />
          )
        }}
        />
        <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
                icon={icons.profile}
                color={color}
                name="Profile"
                focused={focused}
            />
          )
        }}
        />
      </Tabs>
    </>
  )
}

export default TabsLayout