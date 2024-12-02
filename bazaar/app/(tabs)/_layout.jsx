import { View, Text, Image } from 'react-native';
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from 'expo-router';
import "../global.css";

import { icons } from '../../constants';

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="items-center justify-center gap-2 text-center">
      <Image
        source={icon}
        style={{
          tintColor: color, // Ensure tintColor works
          resizeMode: 'contain',
          width: 30,
          height: 30,
        }}
      />
      <Text
        className={`${
          focused ? 'font-psemibold' : 'font-pregular'
        } text-xs text-zinc`}
      >
        {name}
      </Text>
    </View>
  );
};

const [userRole, setUserRole] = useState("buyer");

const fetchUserData = async () => {
  try {
    const userRole = await AsyncStorage.getItem("userRole");
    setUserRole(userRole);
  } catch (error) {
    console.error("Error fetching userID from AsyncStorage:", error);
  }
}

useEffect(() => {
  fetchUserData();
}, []);

const TabsLayout = () => {

  if(userRole == "farmer"){
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
              height: 90,
            },
          }}
        >
          <Tabs.Screen
            name="products"
            options={{
              title: 'MarketPlace',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.crops}
                  color={color}
                  name="Products"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="add-products"
            options={{
              title: 'Add Products',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.plus}
                  color={color}
                  name="Add Products"
                  focused={focused}
                />
              ),
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
              ),
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: 'Chat',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.chat} // Ensure chat icon exists
                  color={color}
                  name="Chat"
                  focused={focused}
                />
              ),
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
              ),
            }}
          />
        </Tabs>
      </>
    );
  }
  else {
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
              height: 90,
            },
          }}
        >
          <Tabs.Screen
            name="products"
            options={{
              title: 'MarketPlace',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.crops}
                  color={color}
                  name="Products"
                  focused={focused}
                />
              ),
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
              ),
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: 'Chat',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.chat} // Ensure chat icon exists
                  color={color}
                  name="Chat"
                  focused={focused}
                />
              ),
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
              ),
            }}
          />
        </Tabs>
      </>
    );
  }

}

export default TabsLayout;
